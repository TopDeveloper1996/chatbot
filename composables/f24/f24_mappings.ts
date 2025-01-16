export const useF24Mappings = () => {
    const getMappedCategory = (section: string, causalTax: string): F24Category | undefined => {
        causalTax = causalTax.toLocaleLowerCase();
        if (causalTax.includes("cf") || causalTax.includes("af")) {
            return F24Category.fissi_inps; //"fissi inps";
        }
        if (causalTax.startsWith("6")) {
            return F24Category.iva; //"iva";
        }
        // if (causalTax.startsWith("4") || causalTax.startsWith("2")) {
        //     return F24Category.versamenti_reddito; //"versamenti reddito";
        // }
        if (causalTax.startsWith("200") || ["2010", "2011", "2012", "2013", "2014", "2015", "2018", "2019", "2020", "2025", "2041", "2042", "2031", "2032", "2033", "2034", "2035", "2036", "4001", "4003", "4004", "4005", "4033", "4034", "4036", "4037", "4038"].includes(causalTax)) {
            return F24Category.versamenti_reddito; //"versamenti reddito";
        }
        if (["3812", "3813", "3800"].includes(causalTax)) {
            return F24Category.irap; //"irap";
        }
        if (["2001","2002","2003"].includes(causalTax)) {
            return F24Category.ires; //"ires";
        }
        if (causalTax === "1040") {
            return F24Category.ritenuta; //"ritenuta";
        }
        if (causalTax === "3850") {
            return F24Category.diritto_camerale; //"diritto camerale";
        }
        if (section.includes("inps")) {
            return F24Category.inps; //"inps";
        }
        if (section.includes("enti previdenziali")) {
            return F24Category.inail; //"inail";
        }
        if (section.includes("regioni")) {
            return F24Category.tasse_regionali; //"tasse regionali";
        }
        if (section.includes("tributi locali")) {
            return F24Category.tasse_locali; //"tasse locali";
        }
        return undefined;
    };
    return { getMappedCategory };
};
