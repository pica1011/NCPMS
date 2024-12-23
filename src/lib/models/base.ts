import { getDb, saveDb } from '../db';

export const executeQuery = (sql: string, params: any[] = []): any[] => {
  const db = getDb();
  const stmt = db.prepare(sql);
  return stmt.getAsObject(params);
};

export const executeWrite = async (sql: string, params: any[] = []): Promise<void> => {
  const db = getDb();
  const stmt = db.prepare(sql);
  stmt.run(params);
  
  // 写操作后保存数据库
  await saveDb();
};