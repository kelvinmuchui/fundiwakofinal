import { getCollection } from './db';
import { AuditLog, ComplianceLog } from './models/AuditLog';

/**
 * Log an action in the audit trail
 * This is used to track all admin actions and important user actions for compliance
 */
export async function logAuditAction(
  action: AuditLog['action'],
  userId: string,
  options?: {
    targetUserId?: string;
    targetId?: string;
    targetType?: string;
    ipAddress?: string;
    userAgent?: string;
    status?: 'success' | 'failure';
    statusCode?: number;
    errorMessage?: string;
    changeDetails?: Record<string, any>;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  try {
    const auditCollection = await getCollection<AuditLog>('audit_logs');
    
    const auditLog: AuditLog = {
      action,
      userId,
      status: options?.status || 'success',
      createdAt: new Date(),
      ...options
    };
    
    await auditCollection.insertOne(auditLog);
  } catch (error) {
    console.error('Error logging audit action:', error);
    // Don't throw - audit logging should not break the application
  }
}

/**
 * Log compliance action (policy acceptance, terms agreement, etc.)
 */
export async function logComplianceAction(
  userId: string,
  action: ComplianceLog['action'],
  options?: {
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  try {
    const complianceCollection = await getCollection<ComplianceLog>('compliance_logs');
    
    const complianceLog: ComplianceLog = {
      userId,
      action,
      accepted: true,
      createdAt: new Date(),
      ...options
    };
    
    await complianceCollection.insertOne(complianceLog);
  } catch (error) {
    console.error('Error logging compliance action:', error);
    // Don't throw - compliance logging should not break the application
  }
}

/**
 * Get audit logs with optional filtering
 * Used for admin compliance dashboard
 */
export async function getAuditLogs(
  filters?: {
    userId?: string;
    action?: string;
    targetType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    skip?: number;
  }
): Promise<AuditLog[]> {
  try {
    const auditCollection = await getCollection<AuditLog>('audit_logs');
    
    const query: any = {};
    
    if (filters?.userId) query.userId = filters.userId;
    if (filters?.action) query.action = filters.action;
    if (filters?.targetType) query.targetType = filters.targetType;
    
    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters?.startDate) query.createdAt.$gte = filters.startDate;
      if (filters?.endDate) query.createdAt.$lte = filters.endDate;
    }
    
    const limit = filters?.limit || 100;
    const skip = filters?.skip || 0;
    
    return await auditCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error('Error retrieving audit logs:', error);
    return [];
  }
}

/**
 * Export audit logs for government compliance reporting
 */
export async function exportAuditLogs(
  startDate: Date,
  endDate: Date,
  format: 'json' | 'csv' = 'json'
): Promise<string> {
  try {
    const logs = await getAuditLogs({
      startDate,
      endDate,
      limit: 10000
    });
    
    if (format === 'csv') {
      // Convert to CSV format
      const headers = ['Action', 'User ID', 'Target Type', 'Status', 'Timestamp', 'IP Address'];
      const rows = logs.map(log => [
        log.action,
        log.userId,
        log.targetType || 'N/A',
        log.status,
        log.createdAt.toISOString(),
        log.ipAddress || 'N/A'
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      return csvContent;
    } else {
      // JSON format
      return JSON.stringify(logs, null, 2);
    }
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    throw error;
  }
}
