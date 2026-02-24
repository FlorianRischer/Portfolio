// Author: Florian Rischer
// Cloudflare Workers API for Portfolio

export interface Env {
  DB: D1Database;
  IMAGES: R2Bucket;
  ENVIRONMENT: string;
  SENDGRID_API_KEY: string;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Helper to create JSON response
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

function errorResponse(message: string, status = 500): Response {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Router
async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Projects routes
    if (path === '/api/projects' && request.method === 'GET') {
      return await getProjects(env, url);
    }
    if (path === '/api/projects' && request.method === 'POST') {
      return await createProject(env, request);
    }
    if (path.match(/^\/api\/projects\/[^/]+$/) && request.method === 'GET') {
      const slug = path.split('/').pop()!;
      return await getProjectBySlug(env, slug);
    }
    if (path.match(/^\/api\/projects\/[^/]+$/) && request.method === 'PUT') {
      const slug = path.split('/').pop()!;
      return await updateProject(env, slug, request);
    }
    if (path.match(/^\/api\/projects\/[^/]+$/) && request.method === 'DELETE') {
      const slug = path.split('/').pop()!;
      return await deleteProject(env, slug);
    }

    // Skills routes (R2-based)
    if (path === '/api/skills' && request.method === 'GET') {
      return await getSkills(env, url);
    }
    if (path === '/api/skills' && request.method === 'POST') {
      return await createSkill(env, request);
    }
    if (path.match(/^\/api\/skills\/[^/]+$/) && request.method === 'PUT') {
      const id = path.split('/').pop()!;
      return await updateSkill(env, id, request);
    }
    if (path.match(/^\/api\/skills\/[^/]+$/) && request.method === 'DELETE') {
      const id = path.split('/').pop()!;
      return await deleteSkill(env, id);
    }

    // Images routes (serve from R2)
    if (path.match(/^\/api\/images\/[^/]+$/) && request.method === 'GET') {
      const slug = path.split('/').pop()!;
      return await getImage(env, slug);
    }

    // Messages routes
    if (path === '/api/messages' && request.method === 'POST') {
      return await createMessage(env, request);
    }

    // Health check
    if (path === '/api/health') {
      return jsonResponse({ status: 'ok', environment: env.ENVIRONMENT });
    }

    return errorResponse('Not Found', 404);
  } catch (error) {
    console.error('Error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}

// Projects handlers
async function getProjects(env: Env, url: URL): Promise<Response> {
  const category = url.searchParams.get('category');
  const featured = url.searchParams.get('featured');

  let query = 'SELECT * FROM projects';
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }
  if (featured === 'true') {
    conditions.push('featured = 1');
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY "order" ASC';

  const result = await env.DB.prepare(query).bind(...params).all();
  
  // Parse JSON fields
  const projects = result.results.map(parseProject);
  
  return jsonResponse(projects);
}

async function getProjectBySlug(env: Env, slug: string): Promise<Response> {
  const result = await env.DB.prepare(
    'SELECT * FROM projects WHERE slug = ?'
  ).bind(slug).first();

  if (!result) {
    return errorResponse('Project not found', 404);
  }

  return jsonResponse(parseProject(result));
}

function parseProject(row: Record<string, unknown>) {
  return {
    ...row,
    technologies: JSON.parse(row.technologies as string || '[]'),
    images: JSON.parse(row.images as string || '[]'),
    screens: JSON.parse(row.screens as string || '[]'),
    featured: Boolean(row.featured),
  };
}

interface ProjectInput {
  title?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  technologies?: string[];
  techDescription?: string | null;
  liveUrl?: string | null;
  githubUrl?: string | null;
  featured?: boolean;
  order?: number;
}

async function createProject(env: Env, request: Request): Promise<Response> {
  const body = await request.json() as ProjectInput;
  
  if (!body.title || !body.slug) {
    return errorResponse('Title and slug are required', 400);
  }
  
  const result = await env.DB.prepare(
    `INSERT INTO projects (title, slug, description, shortDescription, category, technologies, techDescription, liveUrl, githubUrl, featured, "order", images, screens)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', '[]')`
  ).bind(
    body.title,
    body.slug,
    body.description || '',
    body.shortDescription || '',
    body.category || 'ux-design',
    JSON.stringify(body.technologies || []),
    body.techDescription || null,
    body.liveUrl || null,
    body.githubUrl || null,
    body.featured ? 1 : 0,
    body.order || 0
  ).run();

  return jsonResponse({ slug: body.slug, message: 'Project created' }, 201);
}

async function updateProject(env: Env, slug: string, request: Request): Promise<Response> {
  const body = await request.json() as ProjectInput;
  
  console.log('updateProject called with slug:', slug);
  console.log('updateProject body:', JSON.stringify(body));
  
  // Build dynamic update query
  const updates: string[] = [];
  const values: unknown[] = [];
  
  if (body.title !== undefined) { updates.push('title = ?'); values.push(body.title); }
  if (body.description !== undefined) { updates.push('description = ?'); values.push(body.description); }
  if (body.shortDescription !== undefined) { updates.push('shortDescription = ?'); values.push(body.shortDescription); }
  if (body.category !== undefined) { updates.push('category = ?'); values.push(body.category); }
  if (body.technologies !== undefined) { updates.push('technologies = ?'); values.push(JSON.stringify(body.technologies)); }
  if (body.techDescription !== undefined) { updates.push('techDescription = ?'); values.push(body.techDescription); }
  if (body.liveUrl !== undefined) { updates.push('liveUrl = ?'); values.push(body.liveUrl); }
  if (body.githubUrl !== undefined) { updates.push('githubUrl = ?'); values.push(body.githubUrl); }
  if (body.featured !== undefined) { updates.push('featured = ?'); values.push(body.featured ? 1 : 0); }
  if (body.order !== undefined) { updates.push('"order" = ?'); values.push(body.order); }
  if (body.slug !== undefined && body.slug !== slug) { updates.push('slug = ?'); values.push(body.slug); }
  
  if (updates.length === 0) {
    return errorResponse('No fields to update', 400);
  }
  
  values.push(slug);
  
  const query = `UPDATE projects SET ${updates.join(', ')} WHERE slug = ?`;
  console.log('Executing query:', query);
  console.log('With values:', JSON.stringify(values));
  
  const result = await env.DB.prepare(query).bind(...values).run();
  console.log('DB result:', JSON.stringify(result));

  return jsonResponse({ message: 'Project updated' });
}

async function deleteProject(env: Env, slug: string): Promise<Response> {
  await env.DB.prepare('DELETE FROM projects WHERE slug = ?').bind(slug).run();
  return jsonResponse({ message: 'Project deleted' });
}

// Skills handlers (R2-based - stored as JSON file)
interface Skill {
  id: string;
  name: string;
  category: 'tech' | 'design';
  proficiency: number;
  icon: string;
  description?: string;
  order: number;
}

async function getSkillsFromR2(env: Env): Promise<Skill[]> {
  const object = await env.IMAGES.get('skills.json');
  if (!object) {
    return [];
  }
  const text = await object.text();
  return JSON.parse(text);
}

async function saveSkillsToR2(env: Env, skills: Skill[]): Promise<void> {
  await env.IMAGES.put('skills.json', JSON.stringify(skills, null, 2), {
    httpMetadata: { contentType: 'application/json' }
  });
}

async function getSkills(env: Env, url: URL): Promise<Response> {
  const category = url.searchParams.get('category');
  let skills = await getSkillsFromR2(env);
  
  if (category) {
    skills = skills.filter(s => s.category === category);
  }
  
  skills.sort((a, b) => a.order - b.order);
  return jsonResponse(skills);
}

async function createSkill(env: Env, request: Request): Promise<Response> {
  const body = await request.json() as Partial<Skill>;
  
  if (!body.name || !body.category || !body.icon) {
    return errorResponse('Name, category and icon are required', 400);
  }
  
  const skills = await getSkillsFromR2(env);
  const newSkill: Skill = {
    id: crypto.randomUUID(),
    name: body.name,
    category: body.category,
    proficiency: body.proficiency || 3,
    icon: body.icon,
    description: body.description || '',
    order: body.order || skills.length
  };
  
  skills.push(newSkill);
  await saveSkillsToR2(env, skills);
  
  return jsonResponse(newSkill, 201);
}

async function updateSkill(env: Env, id: string, request: Request): Promise<Response> {
  const body = await request.json() as Partial<Skill>;
  const skills = await getSkillsFromR2(env);
  
  const index = skills.findIndex(s => s.id === id);
  if (index === -1) {
    return errorResponse('Skill not found', 404);
  }
  
  skills[index] = {
    ...skills[index],
    ...body,
    id // Ensure ID cannot be changed
  };
  
  await saveSkillsToR2(env, skills);
  return jsonResponse(skills[index]);
}

async function deleteSkill(env: Env, id: string): Promise<Response> {
  const skills = await getSkillsFromR2(env);
  const filtered = skills.filter(s => s.id !== id);
  
  if (filtered.length === skills.length) {
    return errorResponse('Skill not found', 404);
  }
  
  await saveSkillsToR2(env, filtered);
  return jsonResponse({ message: 'Skill deleted' });
}

// Images handler (serve from R2)
async function getImage(env: Env, slug: string): Promise<Response> {
  // First get image metadata from D1
  const metadata = await env.DB.prepare(
    'SELECT filename, mimeType FROM images WHERE slug = ?'
  ).bind(slug).first();

  if (!metadata) {
    return errorResponse('Image not found', 404);
  }

  // Get image from R2
  const object = await env.IMAGES.get(metadata.filename as string);
  
  if (!object) {
    return errorResponse('Image file not found', 404);
  }

  const headers = new Headers();
  headers.set('Content-Type', metadata.mimeType as string);
  headers.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
  headers.set('Access-Control-Allow-Origin', '*');

  return new Response(object.body, { headers });
}

// Messages handler
async function createMessage(env: Env, request: Request): Promise<Response> {
  const body = await request.json() as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  // Validate
  if (!body.name || !body.email || !body.subject || !body.message) {
    return errorResponse('All fields are required', 400);
  }

  // Email validation
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(body.email)) {
    return errorResponse('Invalid email address', 400);
  }

  // Insert message into database
  const result = await env.DB.prepare(
    `INSERT INTO messages (name, email, subject, message, createdAt) 
     VALUES (?, ?, ?, ?, datetime('now'))`
  ).bind(body.name, body.email, body.subject, body.message).run();

  // Send email via SendGrid
  try {
    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: 'uxdesign@flo-rischer.de' }],
        }],
        from: { 
          email: 'florian.rischer@icloud.com',
          name: 'Portfolio Contact Form'
        },
        reply_to: {
          email: body.email,
          name: body.name
        },
        subject: `Portfolio Kontakt: ${body.subject}`,
        content: [{
          type: 'text/plain',
          value: `Neue Nachricht von deinem Portfolio Kontaktformular:\n\n` +
                 `Name: ${body.name}\n` +
                 `E-Mail: ${body.email}\n` +
                 `Betreff: ${body.subject}\n\n` +
                 `Nachricht:\n${body.message}`
        }, {
          type: 'text/html',
          value: `<h2>Neue Nachricht von deinem Portfolio Kontaktformular</h2>` +
                 `<p><strong>Name:</strong> ${body.name}</p>` +
                 `<p><strong>E-Mail:</strong> <a href="mailto:${body.email}">${body.email}</a></p>` +
                 `<p><strong>Betreff:</strong> ${body.subject}</p>` +
                 `<hr>` +
                 `<p><strong>Nachricht:</strong></p>` +
                 `<p>${body.message.replace(/\n/g, '<br>')}</p>`
        }]
      })
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('SendGrid error:', errorText);
      // Still return success since message was saved to DB
    }
  } catch (emailError) {
    console.error('Failed to send email:', emailError);
    // Still return success since message was saved to DB
  }

  return jsonResponse({ 
    id: result.meta.last_row_id,
    message: 'Message sent successfully' 
  }, 201);
}

export default {
  fetch: handleRequest,
};
