declare interface ITaffyInstance<T> {
    (query?: any): ITaffyResults<T>;
}

declare interface ITaffyResults<T> {
    remove(): number;
    get(): T[];
}
