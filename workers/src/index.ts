// Author: Florian Rischer
// Cloudflare Workers API for Portfolio

export interface Env {
  DB: D1Database;
  IMAGES: R2Bucket;
  RATE_LIMIT: KVNamespace;
  ENVIRONMENT: string;
  SENDGRID_API_KEY: string;
}

// Rate limit config
const RATE_LIMIT_MAX = 5; // Max requests
const RATE_LIMIT_WINDOW = 3600; // 1 hour in seconds

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

    // Project mockup upload routes
    if (path.match(/^\/api\/projects\/[^/]+\/mockup$/) && request.method === 'POST') {
      const slug = path.split('/')[3];
      return await uploadProjectMockup(env, slug, request);
    }
    if (path.match(/^\/api\/projects\/[^/]+\/mockup-existing$/) && request.method === 'POST') {
      const slug = path.split('/')[3];
      return await setProjectMockupExisting(env, slug, request);
    }

    // Project gallery image routes
    if (path.match(/^\/api\/projects\/[^/]+\/gallery$/) && request.method === 'POST') {
      const slug = path.split('/')[3];
      return await addGalleryImage(env, slug, request);
    }
    if (path.match(/^\/api\/projects\/[^/]+\/gallery\/\d+$/) && request.method === 'DELETE') {
      const parts = path.split('/');
      const slug = parts[3];
      const index = parseInt(parts[5]);
      return await removeGalleryImage(env, slug, index);
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
    if (path.match(/^\/api\/images\/[^/]+$/) && (request.method === 'GET' || request.method === 'HEAD')) {
      const slug = path.split('/').pop()!;
      return await getImage(env, slug, request);
    }

    // Messages routes
    if (path === '/api/messages' && request.method === 'POST') {
      return await createMessage(env, request);
    }

    // Rate limit status (for debugging)
    if (path === '/api/rate-limit-status' && request.method === 'GET') {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const key = `rate_limit:${ip}`;
      const current = await env.RATE_LIMIT.get(key);
      return jsonResponse({ ip, requests: current ? parseInt(current) : 0, max: RATE_LIMIT_MAX });
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
  const filename = (row.thumbnailFilename as string) || '';
  return {
    ...row,
    technologies: JSON.parse(row.technologies as string || '[]'),
    images: JSON.parse(row.images as string || '[]'),
    screens: JSON.parse(row.screens as string || '[]'),
    featured: Boolean(row.featured),
    useScreensAsGallery: Boolean(row.useScreensAsGallery),
    isVideoHero: /\.(mp4|webm|mov)$/i.test(filename),
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
  useScreensAsGallery?: boolean;
}

async function createProject(env: Env, request: Request): Promise<Response> {
  const body = await request.json() as ProjectInput;
  
  if (!body.title || !body.slug) {
    return errorResponse('Title and slug are required', 400);
  }
  
  const result = await env.DB.prepare(
    `INSERT INTO projects (title, slug, description, shortDescription, category, technologies, techDescription, liveUrl, githubUrl, featured, "order", images, screens, useScreensAsGallery)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', '[]', ?)`
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
    body.order || 0,
    body.useScreensAsGallery ? 1 : 0
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
  if (body.useScreensAsGallery !== undefined) { updates.push('useScreensAsGallery = ?'); values.push(body.useScreensAsGallery ? 1 : 0); }
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

// Project mockup handlers
async function uploadProjectMockup(env: Env, slug: string, request: Request): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return errorResponse('No file provided', 400);
    }
    
    // Get file extension
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const r2Key = `project-${slug}-mockup.${ext}`;
    
    // Upload to R2
    const arrayBuffer = await file.arrayBuffer();
    await env.IMAGES.put(r2Key, arrayBuffer, {
      httpMetadata: { contentType: file.type || 'image/png' }
    });
    
    // Update project in database with thumbnail filename
    await env.DB.prepare(
      'UPDATE projects SET thumbnailFilename = ? WHERE slug = ?'
    ).bind(r2Key, slug).run();
    
    return jsonResponse({ message: 'Mockup uploaded', filename: r2Key });
  } catch (error) {
    console.error('Mockup upload error:', error);
    return errorResponse('Failed to upload mockup', 500);
  }
}

async function setProjectMockupExisting(env: Env, slug: string, request: Request): Promise<Response> {
  try {
    const body = await request.json() as { imageSlug: string };
    
    if (!body.imageSlug) {
      return errorResponse('Image slug is required', 400);
    }
    
    // Find the existing image in R2
    const imageSlug = body.imageSlug;
    
    // Look for the image with common extensions
    const extensions = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
    let foundKey: string | null = null;
    
    for (const ext of extensions) {
      const key = `${imageSlug}.${ext}`;
      const object = await env.IMAGES.head(key);
      if (object) {
        foundKey = key;
        break;
      }
    }
    
    // Also check without extension (the slug might be the full key)
    if (!foundKey) {
      const object = await env.IMAGES.head(imageSlug);
      if (object) {
        foundKey = imageSlug;
      }
    }
    
    if (!foundKey) {
      return errorResponse('Image not found', 404);
    }
    
    // Copy the image to the project's mockup key
    const existingObject = await env.IMAGES.get(foundKey);
    if (!existingObject) {
      return errorResponse('Image not found', 404);
    }
    
    const ext = foundKey.split('.').pop() || 'png';
    const newKey = `project-${slug}-mockup.${ext}`;
    
    // Copy the image data
    const imageData = await existingObject.arrayBuffer();
    await env.IMAGES.put(newKey, imageData, {
      httpMetadata: existingObject.httpMetadata
    });
    
    // Update project in database
    await env.DB.prepare(
      'UPDATE projects SET thumbnailFilename = ? WHERE slug = ?'
    ).bind(newKey, slug).run();
    
    return jsonResponse({ message: 'Mockup set', filename: newKey });
  } catch (error) {
    console.error('Set mockup existing error:', error);
    return errorResponse('Failed to set mockup', 500);
  }
}

// Gallery image handlers
async function addGalleryImage(env: Env, slug: string, request: Request): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const timestamp = Date.now().toString(36);
    const imageSlug = `project-${slug}-gallery-${timestamp}`;
    const r2Key = `${imageSlug}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    await env.IMAGES.put(r2Key, arrayBuffer, {
      httpMetadata: { contentType: file.type || 'image/png' }
    });

    await env.DB.prepare(
      `INSERT INTO images (id, name, slug, category, mimeType, size, filename) VALUES (?, ?, ?, 'project', ?, ?, ?)`
    ).bind(crypto.randomUUID(), `${slug} Gallery`, imageSlug, file.type || 'image/png', file.size, r2Key).run();

    const project = await env.DB.prepare('SELECT images FROM projects WHERE slug = ?').bind(slug).first();
    if (!project) return errorResponse('Project not found', 404);

    const currentImages: string[] = JSON.parse(project.images as string || '[]');
    currentImages.push(imageSlug);

    await env.DB.prepare(
      'UPDATE projects SET images = ? WHERE slug = ?'
    ).bind(JSON.stringify(currentImages), slug).run();

    return jsonResponse({ message: 'Gallery image added', imageSlug });
  } catch (error) {
    console.error('Gallery upload error:', error);
    return errorResponse('Failed to add gallery image', 500);
  }
}

async function removeGalleryImage(env: Env, slug: string, index: number): Promise<Response> {
  const project = await env.DB.prepare('SELECT images FROM projects WHERE slug = ?').bind(slug).first();
  if (!project) return errorResponse('Project not found', 404);

  const currentImages: string[] = JSON.parse(project.images as string || '[]');
  if (index < 0 || index >= currentImages.length) {
    return errorResponse('Image index out of range', 400);
  }

  currentImages.splice(index, 1);

  await env.DB.prepare(
    'UPDATE projects SET images = ? WHERE slug = ?'
  ).bind(JSON.stringify(currentImages), slug).run();

  return jsonResponse({ message: 'Gallery image removed' });
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

// Images handler (serve from R2, with Range support for video)
async function getImage(env: Env, slug: string, request: Request): Promise<Response> {
  // First get image metadata from D1
  const metadata = await env.DB.prepare(
    'SELECT filename, mimeType FROM images WHERE slug = ?'
  ).bind(slug).first();

  let r2Key: string | null = null;
  let contentType = 'application/octet-stream';

  if (metadata) {
    r2Key = metadata.filename as string;
    contentType = metadata.mimeType as string;
  } else {
    // Fallback: Try to find directly in R2 by slug with various extensions
    const extensions = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4', 'webm', 'mov'];
    const mimeTypes: Record<string, string> = {
      'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
      'webp': 'image/webp', 'gif': 'image/gif', 'mp4': 'video/mp4',
      'webm': 'video/webm', 'mov': 'video/quicktime',
    };
    for (const ext of extensions) {
      const key = `${slug}.${ext}`;
      const head = await env.IMAGES.head(key);
      if (head) {
        r2Key = key;
        contentType = mimeTypes[ext] || 'image/png';
        break;
      }
    }
  }

  if (!r2Key) return errorResponse('Image not found', 404);

  const rangeHeader = request.headers.get('Range');
  const isHead = request.method === 'HEAD';

  if (rangeHeader) {
    const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
    if (match) {
      const objHead = await env.IMAGES.head(r2Key);
      if (!objHead) return errorResponse('Image not found', 404);

      const totalSize = objHead.size;
      const start = parseInt(match[1]);
      const end = match[2] ? parseInt(match[2]) : totalSize - 1;
      const length = end - start + 1;

      const headers = new Headers();
      headers.set('Content-Type', contentType);
      headers.set('Cache-Control', 'public, max-age=31536000');
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Accept-Ranges', 'bytes');
      headers.set('Content-Range', `bytes ${start}-${end}/${totalSize}`);
      headers.set('Content-Length', String(length));

      if (isHead) return new Response(null, { status: 206, headers });

      const object = await env.IMAGES.get(r2Key, { range: { offset: start, length } });
      if (!object) return errorResponse('Image not found', 404);
      return new Response(object.body, { status: 206, headers });
    }
  }

  const object = await env.IMAGES.get(r2Key);
  if (!object) return errorResponse('Image not found', 404);

  const headers = new Headers();
  headers.set('Content-Type', contentType);
  headers.set('Cache-Control', 'public, max-age=31536000');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Content-Length', String(object.size));

  return new Response(isHead ? null : object.body, { headers });
}

// Messages handler
async function createMessage(env: Env, request: Request): Promise<Response> {
  // Rate limiting by IP
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rateLimitKey = `rate_limit:${ip}`;
  
  const currentCount = await env.RATE_LIMIT.get(rateLimitKey);
  const count = currentCount ? parseInt(currentCount) : 0;
  
  if (count >= RATE_LIMIT_MAX) {
    return errorResponse('Too many requests. Please try again later.', 429);
  }

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

  // Increment rate limit counter
  await env.RATE_LIMIT.put(rateLimitKey, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW });

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
