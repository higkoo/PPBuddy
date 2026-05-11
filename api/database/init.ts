import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';

let db: SqlJsDatabase | null = null;

const getDatabasePath = (): string => {
  return process.env.DATABASE_PATH || './data/workmate.db';
};

const getDatabaseDir = (): string => {
  const dbPath = getDatabasePath();
  return path.dirname(dbPath);
};

export const saveDatabase = (): void => {
  if (!db) return;
  
  const data = db.export();
  const buffer = Buffer.from(data);
  const dbPath = getDatabasePath();
  
  const dbDir = getDatabaseDir();
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  fs.writeFileSync(dbPath, buffer);
};

export const initDatabase = async (): Promise<SqlJsDatabase> => {
  const SQL = await initSqlJs();
  
  const dbDir = getDatabaseDir();
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = getDatabasePath();
  
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      logo TEXT,
      config TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      tenant_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      expert_mode_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (expert_mode_id) REFERENCES expert_modes(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS expert_modes (
      id TEXT PRIMARY KEY,
      tenant_id TEXT,
      creator_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      system_prompt TEXT NOT NULL,
      is_preset INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const result = db.exec('SELECT COUNT(*) as count FROM expert_modes WHERE is_preset = 1');
  const count = result.length > 0 && result[0].values.length > 0 ? result[0].values[0][0] as number : 0;
  
  if (count === 0) {
    const presetExperts = [
      {
        id: 'preset-tech-advisor',
        name: '技术顾问',
        description: '提供专业的技术咨询、代码审查、架构设计建议',
        systemPrompt: '你是一位经验丰富的技术顾问，精通多种编程语言、软件架构和最佳实践。请提供专业、准确的技术建议，帮助用户解决技术问题，优化代码质量，提升系统性能。'
      },
      {
        id: 'preset-product-manager',
        name: '产品经理',
        description: '协助产品规划、需求分析、用户体验优化',
        systemPrompt: '你是一位资深产品经理，擅长产品规划、需求分析、用户体验设计和市场分析。请帮助用户梳理产品思路，优化用户体验，制定产品策略。'
      },
      {
        id: 'preset-data-analyst',
        name: '数据分析师',
        description: '数据分析、可视化建议、统计方法指导',
        systemPrompt: '你是一位专业的数据分析师，精通数据分析方法、统计模型和数据可视化。请帮助用户分析数据，解读结果，提供有价值的洞察和建议。'
      },
      {
        id: 'preset-creative-writer',
        name: '创意写作',
        description: '文案创作、内容策划、创意灵感激发',
        systemPrompt: '你是一位才华横溢的创意写作者，擅长各类文案创作、内容策划和创意表达。请帮助用户激发创意，撰写优质内容，提升写作质量。'
      },
      {
        id: 'preset-english-translator',
        name: '英语翻译',
        description: '中英文互译、本地化建议、语言表达优化',
        systemPrompt: '你是一位专业的英语翻译，精通中英文互译、文化差异和本地化策略。请提供准确的翻译服务，帮助用户优化语言表达，确保沟通效果。'
      }
    ];

    for (const expert of presetExperts) {
      db.run(
        'INSERT INTO expert_modes (id, tenant_id, creator_id, name, description, system_prompt, is_preset, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, datetime("now"))',
        [expert.id, null, null, expert.name, expert.description, expert.systemPrompt]
      );
    }
  }

  saveDatabase();
  return db;
};

export const getDatabase = (): SqlJsDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

export const isInitialized = (): boolean => {
  return db !== null;
};

export default { initDatabase, getDatabase, saveDatabase, isInitialized };
