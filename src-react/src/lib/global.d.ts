export { };

declare global {
    interface Window {
        electron: {
            writeFile: (filePath: string, data: string) => Promise<void>;
            readFile: (filePath: string) => Promise<string>;
            fileExists: (filePath: string) => Promise<boolean>;
        };
    }
}