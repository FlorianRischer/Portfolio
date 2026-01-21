// Author: Florian Rischer
import app from './app';
import { connectDB } from './config/database';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation:`);
      console.log(`   GET    /api/projects      - Get all projects`);
      console.log(`   GET    /api/projects/:id  - Get project by ID`);
      console.log(`   POST   /api/projects      - Create new project`);
      console.log(`   PUT    /api/projects/:id  - Update project`);
      console.log(`   DELETE /api/projects/:id  - Delete project`);
      console.log(`   GET    /api/skills        - Get all skills`);
      console.log(`   POST   /api/messages      - Send contact message`);
      console.log(`   GET    /api/messages      - Get all messages`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
