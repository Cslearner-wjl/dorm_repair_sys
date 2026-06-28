package com.dorm.repair.common;

import java.util.List;

public class PageResult<T> {

    private int page;
    private int pageSize;
    private long total;
    private List<T> items;

    public PageResult() {
    }

    public PageResult(int page, int pageSize, long total, List<T> items) {
        this.page = page;
        this.pageSize = pageSize;
        this.total = total;
        this.items = items;
    }

    public static <T> PageResult<T> of(int page, int pageSize, long total, List<T> items) {
        return new PageResult<>(page, pageSize, total, items);
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public List<T> getItems() {
        return items;
    }

    public void setItems(List<T> items) {
        this.items = items;
    }
}
