interface From {
    pathname: string;
    search: string;
    hash: string;
    state?: object;
    key: string;
}
interface State {
    from: From;
}
export interface LocationObj {
    pathname: string;
    search: string;
    hash: string;
    state: State;
    key: string;
}