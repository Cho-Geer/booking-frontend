/**
 * 分页参数定义
 */
export interface Pagination {
    page: number;
    limit: number;
    total?: number;
    totalPages?: number;
}