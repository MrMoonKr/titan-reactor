export type ReadFile = ( filename: string ) => Promise<Buffer>;

export type OpenCascStorage = ( bwPath: string ) => Promise<boolean>;
export type CloseCascStorage = ( bwPath: string ) => void;
export type ReadCascFile = (
    bwPath: string,
    encoding?: BufferEncoding
) => Promise<ArrayBuffer>;
export type ReadCascFileBatch = (
    bwPath: string[],
    encoding?: BufferEncoding
) => Promise<ArrayBuffer[]>;
