export const useCsvParser = () => {
    const detect = (input: string): string => {
        const separators = [",", ";", "|", "\t"];
        const idx = separators
            .map((separator) => input.indexOf(separator))
            .reduce((prev, cur) => (prev === -1 || (cur !== -1 && cur < prev) ? cur : prev));
        return input[idx] || ",";
    };

    function mapField(v: string): string | null {
        if (v.toLocaleLowerCase() === "undefined" || v.toLocaleLowerCase() === "null") return null;
        return v;
    }

    const parseWithHeaders = (content: string): any[] => {
        let rows = content.split("\n");
        let separator = detect(content.trim());
        let headers = rows[0].split(separator);
        rows = rows.slice(1);
        let results: any[] = [];
        for (const row of rows) {
            let columns = row.split(separator);
            let element: any = {};
            for (let i = 0; i < Math.max(headers.length, columns.length); i++) {
                element[headers[i]] = mapField(columns[i]);
            }
            results.push(element);
        }
        return results;
    };
    const parsePositional = (content: string): any[][] => {
        let rows = content.split("\n").filter((x) => x !== "\r" && x !== "\n" && x.length > 0);
        let separator = detect(content.trim());
        let results: any[][] = [];
        for (const row of rows) {
            if (row.length <= 0) continue;
            let columns = row.split(separator);
            results.push(columns);
        }
        return results;
    };
    return { parseWithHeaders, parsePositional };
};
