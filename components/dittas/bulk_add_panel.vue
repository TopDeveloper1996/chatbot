<template>
    <div class="flex flex-col">
        <Info>La funazionalità di inserimento ditte è in fase di test, <span class="font-bold"
                >in caso di problemi riscontrati mandare una mail al supporto al più presto!</span
            ></Info>
        <div class="flex flex-col gap-2">
            <div>
                <div class="flex flex-row gap-2 items-center mb-6">
                    <icon name="material-symbols:developer-guide-rounded" class="size-8 text-accent"></icon>
                    <h2 class="m-0">Istruzioni</h2>
                </div>
                <p>
                    Il file deve rispettare un preciso formato per essere accettato. Deve avere le colonne indicate
                    nella tabella qui sotto, nell'ordine corretto.<br />
                    Una volta caricato, il file verrà analizzato ed eventuali problemi evidenziati prima di procedere
                    con l'aggiunta multipla.<br /><br />
                    Da seguire le seguenti regole:<br />
                    <p>
                        ● Il file deve essere in formato <span class="font-semibold text-accent">.csv</span> ed essere
                    delimitato dalla virgola <span class="font-semibold text-xl text-accent">, </span><br /> ● Ogni riga
                    deve contenere i dati di una singola ditta<br />
                    </p>
                    <p>
                        ● Per i valori <span class="text-orange-400">opzionali</span>, lasciare il vuoto se non si vuole fornire un valore<br />
                    </p>
                    <p class="pl-3 text-text/75">
                        Ad esempio, una riga con un valore vuoto avrà due virgole vicine che indicano un valore non
                        fornito: <span class="font-bold">campo1,campo2,,campo4</span> in questo caso il
                        <span class="font-bold">campo3</span> non è stato fornito.
                    </p>
                    <p>
                        ● Rispettare la posizione delle colonne, ogni elemento deve essere posizionato nell'ordine giusto
                    mostrato nella tabella qui sotto.
                    </p>                                        
                </p>
                <table class="mt-4 conto-table overflow-x-scroll">
                    <thead>
                        <tr>
                            <th class="text-nowrap">1. Partita IVA</th>
                            <th class="text-nowrap">2. Codice Fiscale</th>
                            <th class="text-nowrap">3. Nome registrato</th>
                            <th class="text-nowrap">4. Numero ditta</th>
                            <th class="text-nowrap">5. Profilo entratel</th>
                            <th class="text-nowrap">6. Tipo di accesso</th>
                            <th class="text-nowrap">
                                7. Intermediario<br />
                                <p class="text-sm text-orange-400">Opzionale</p>
                            </th>
                            <th class="text-nowrap">
                                8. Incaricato<br />
                                <p class="text-sm text-orange-400">Opzionale</p>
                            </th>
                            <th class="text-nowrap">
                                9. Codice ATECO
                            </th>
                            <th class="text-nowrap">
                                10. Descrizione ATECO
                            </th>
                            <th class="text-nowrap">
                                11. Processi in ingresso<br />
                                <p class="text-sm text-orange-400">Opzionale</p>
                            </th class="text-nowrap">
                            <th class="text-nowrap">
                                12. Tipo di processo<br />
                                <p class="text-sm text-orange-400">Opzionale</p>
                            </th>
                            <th class="text-nowrap">
                                13. Output del processo<br />
                                <p class="text-sm text-orange-400">Opzionale</p>
                            </th>
                            <th class="text-nowrap">
                                14. Distribuzione beni o servizi<br />
                                <p class="text-sm text-orange-400">Opzionale</p>
                            </th>
                            <th class="text-nowrap">
                                15. Chi sono i clienti<br />
                                <p class="text-sm text-orange-400">Opzionale</p>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="align-top">
                            <td>Partita IVA della ditta</td>
                            <td>Codice Fiscale della ditta</td>
                            <td>Nome della ditta da registrare</td>
                            <td>Numero da assegnare alla ditta</td>
                            <td>
                                Profilo entratel, valori validi: <br />
                                <p class="font-semibold text-accent" v-for=" p in l.uniqBy(profiles,p=>p.codice_entratel)">{{ p.codice_entratel }}</p>
                            </td>
                            <td>
                                Tipo di accesso, valori validi: <br />
                                <p
                                    class="font-semibold text-accent"
                                    v-for="p in [
                                        'ME_STESSO',
                                        'DELEGA_DIRETTO',
                                        'INCARICATO_DELEGATO',
                                        'INCARICATO_DIRETTAMENTE',
                                    ]"
                                >
                                    {{ p }}
                                </p>
                            </td>
                            <td>
                                Codice fiscale intermediario ditta, valori validi: <br />
                                <p
                                    class="font-semibold text-accent"
                                    v-for="p in l.uniq(collaborators.map((c) => c.fiscal_code))"
                                >
                                    {{ p }}
                                </p>
                            </td><td>Nome del collaboratore incaricato</td>
                            <td>Codice ATECO della ditta</td>
                            <td>Descrizione del codice ATECO</td>
                            <td>Processi in ingresso</td>
                            <td>Tipo di processo</td>
                            <td>Output del processo</td>
                            <td>Distribuzione beni o servizi</td>
                            <td>Chi sono i clienti</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="divider"></div>
            <div class="w-full flex flex-row items-center justify-center">
                <button class="primary-button" @click="updateFiles">
                    <div class="flex flex-col gap-2 items-center">
                        <div class="flex flex-row gap-2 items-center">
                            <p>Carica file</p>
                            <icon name="material-symbols:drive-folder-upload-rounded" class="size-6"></icon>
                        </div>
                        <p class="text-sm font-light">Formati supportati: .csv</p>
                    </div>
                </button>
            </div>

            <div v-if="validationResults.length > 0" class="mt-8 flex flex-col gap-2 items-start justify-start w-full">
                <h3>Risultati validazione dati</h3>
                <p class="font-bold text-lg" :class="[l.sumBy(validationResults, v=>v.columnErrors.length)>0?'text-red-600':'text-green-500' ]">Errori: {{ l.sumBy(validationResults, v=>v.columnErrors.length) }}</p>
                <table class="mt-4 conto-table flex-1 h-min min-w-[12rem]">
                    <thead>
                        <tr>
                            <th>Stato</th>
                            <th>Partita IVA</th>
                            <th>Codice Fiscale</th>
                            <th>Nome registrato</th>
                            <th>Numero ditta</th>
                            <th>Profilo entratel</th>
                            <th>Tipo di accesso</th>
                            <th>Intermediario</th>
                            <th>Collaboratore</th>
                            <th>Codice ATECO</th>
                            <th>Descrizione ATECO</th>
                            <th>Processi in ingresso</th>
                            <th>Tipo di processo</th>
                            <th>Output del processo</th>
                            <th>Distribuzione beni o servizi</th>
                            <th>Chi sono i clienti</th>
                            <th>Problemi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="v in validationResults">
                            <td>
                                <icon
                                    :name="
                                        v.columnErrors.length <= 0
                                            ? 'material-symbols:check-circle-rounded'
                                            : 'material-symbols:error-circle-rounded'
                                    "
                                    class="size-8"
                                    :class="{
                                        'text-green-500': v.columnErrors.length <= 0,
                                        'text-red-600': v.columnErrors.length > 0,
                                    }"
                                ></icon>
                            </td>
                            <td>{{ v.data[VAT_COL] }}</td>
                            <td>{{ v.data[CF_COL] }}</td>
                            <td>{{ v.data[NAME_COL] }}</td>
                            <td>{{ v.data[NUMBER_COL] }}</td>
                            <td>{{ v.data[PROFILE_COL] }}</td>
                            <td>{{ v.data[ACCESS_COL] }}</td>
                            <td>{{ v.data[APPOINTING_CF_COL] }}</td>
                            <td>{{ v.data[COLLABORATOR] }}</td>
                            <td>{{ v.data[ATECO_CODE] }}</td>
                            <td>{{ v.data[ATECO_DESC] }}</td>
                            <td>{{ v.data[PROCESS_INPUTS] }}</td>
                            <td>{{ v.data[BUSINESS_PROCESS_TYPE] }}</td>
                            <td>{{ v.data[BUSINESS_PROCESS_OUTPUT] }}</td>
                            <td>{{ v.data[GOOD_OR_SERVICE_DISTRIBUTION] }}</td>
                            <td>{{ v.data[CUSTOMERS_DESCRIPTION] }}</td>
                            <td class="text-red-400 flex flex-col items-start h-full">
                                <p v-for="c in v.columnErrors">
                                    {{ `● Colonna ${c.index}: ${c.message}` }}
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="mt-4 w-full flex flex-row items-center justify-center">
                    <button
                        :disabled="fetching || !validationResults.every((v) => v.columnErrors.length <= 0)"
                        @click="submit"
                        class="primary-button"
                    >
                        <icon name="material-symbols:check-circle-rounded" class="size-8"></icon>
                        <p>Conferma e aggiungi ditte</p>
                    </button>
                </div>
                <div class="w-full text-center">
                    <Transition name="fade" appear mode="out-in">
                        <div v-if="fetching" class="flex justify-center w-full">
                            <div class="flex items-center flex-row gap-2">
                                <icon class="size-6" name="line-md:loading-twotone-loop"></icon>
                                <p class="">Aggiungendo {{ dittaRows.length }} ditte</p>
                            </div>
                        </div>
                        <div v-else-if="addSuccess !== undefined">
                            <p :class="{ 'text-green-500': addSuccess, 'text-red-600': !addSuccess }">
                                {{ addSuccess ? "Ditte inserite" : "Inserimento fallito" }}
                            </p>
                        </div></Transition
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import l from "lodash";
const VAT_COL = 0;
const CF_COL = 1;
const NAME_COL = 2;
const NUMBER_COL = 3;
const PROFILE_COL = 4;
const ACCESS_COL = 5;
const APPOINTING_CF_COL = 6;
const COLLABORATOR = 7;
const ATECO_CODE = 8;
const ATECO_DESC = 9;
const PROCESS_INPUTS = 10;
const BUSINESS_PROCESS_TYPE = 11;
const BUSINESS_PROCESS_OUTPUT = 12;
const GOOD_OR_SERVICE_DISTRIBUTION = 13;
const CUSTOMERS_DESCRIPTION = 14;

const OPTIONAL_COLS = [APPOINTING_CF_COL, COLLABORATOR, PROCESS_INPUTS, BUSINESS_PROCESS_TYPE, BUSINESS_PROCESS_OUTPUT, GOOD_OR_SERVICE_DISTRIBUTION, CUSTOMERS_DESCRIPTION];

class ValidationRowResult {
    row: number;
    columnErrors: { index: number; message: string }[];
    data: (string | undefined)[];
    constructor(row: number, data: (string | undefined)[], columnErrors: { index: number; message: string }[]) {
        this.row = row;
        this.data = data;
        this.columnErrors = columnErrors;
    }
}
const csv = useCsvParser();
const fetching = ref(false);
const validationResults = ref<ValidationRowResult[]>([]);
const dittaRows = ref<any[][]>([]);
const endpoints = useEndpoints();
const { api } = useApi();
const cpa = useCpa();
const addSuccess = ref<boolean | undefined>(undefined);
const props = defineProps<{ collaborators: any[]; profiles: any[] }>();
const emit = defineEmits<{ (e: "dittasAdded", model: any[]): void }>();
const { open, onChange,reset } = useFileDialog({
    accept: ".csv",
    directory: false,
    multiple: false,
});

function updateFiles() {
    reset();
    open();
}

function submit() {
    fetching.value = true;
    api(endpoints.userDittas, {
        method: "POST",
        query: { customer_id: cpa.getData.id },
        body: {
            scraper_api_token: cpa.scraperApiAccess,
            dittas: dittaRows.value.map((ditta: any) => {
                let appointingSubject = props.collaborators.find((c) => c.fiscal_code == ditta[APPOINTING_CF_COL]);
                let profile = props.profiles.find((c) => c.codice_entratel == ditta[PROFILE_COL]);
                return {
                    vat_id: ditta[VAT_COL],
                    codice_fiscale: ditta[CF_COL],
                    cpa: Number.parseInt(cpa.getData.id),
                    registered_name: ditta[NAME_COL],
                    ditta_number: Number.parseInt(ditta[NUMBER_COL]),
                    enabled_profile: profile !== undefined ? Number.parseInt(profile.id) : undefined,
                    access_type: ditta[ACCESS_COL],
                    appointed_collaborator: ditta[COLLABORATOR],
                    appointing_subject:
                        appointingSubject !== undefined ? Number.parseInt(appointingSubject.id) : undefined,
                    ateco_code: ditta[ATECO_CODE],
                    ateco_description: ditta[ATECO_DESC],
                    process_inputs: ditta[PROCESS_INPUTS],
                    business_process_type: ditta[BUSINESS_PROCESS_TYPE],
                    business_process_output: ditta[BUSINESS_PROCESS_OUTPUT],
                    good_or_service_distribution: ditta[GOOD_OR_SERVICE_DISTRIBUTION],
                    customers_description: ditta[CUSTOMERS_DESCRIPTION],

                };
            }),
        },
        onResponse: async ({ request, response, options }) => {
            if (response.ok) {
                addSuccess.value = true;
                emit("dittasAdded", dittaRows.value);
                console.log(`ditta add submitted`);
            } else {
                addSuccess.value = false;
                console.error(`problem with adding ditta: ${JSON.stringify(response._data)}`);
            }
            fetching.value = false;
        },
        onResponseError({ request, response, options }) {
            fetching.value = false;
            addSuccess.value = false;
            console.log(`problem with adding ditta: ${JSON.stringify(response._data)}`);
        },
    });
}

function validateAndFormatRow(row: string[]): {
    formatted: (string | undefined)[];
    errors: { index: number; message: string }[];
} {
    let formatted = row.map((e) => (e.length <= 0 ? undefined : e.toLocaleUpperCase().trim()));
    let errors: { index: number; message: string }[] = [];
    for (let i = 0; i < 15; i++) {
        if (!OPTIONAL_COLS.includes(i) && formatted[i] === undefined) {
            errors.push({ index: i + 1, message: "Valore vuoto" });
        }
        if (i === PROFILE_COL && !props.profiles.map((p) => p.codice_entratel).includes(formatted[i])) {
            errors.push({ index: i + 1, message: `valore [${formatted[i]}] non consentito` });
        }
        if (
            i === ACCESS_COL &&
            (formatted[i] === undefined ||
                !["ME_STESSO", "DELEGA_DIRETTO", "INCARICATO_DELEGATO", "INCARICATO_DIRETTAMENTE"].includes(
                    formatted[i]!
                ))
        ) {
            errors.push({ index: i + 1, message: `valore [${formatted[i]}] non consentito` });
        }
        if (
            i === APPOINTING_CF_COL && formatted[i]!== undefined &&
            !props.collaborators.map((c) => c.fiscal_code).includes(formatted[i])
        ) {
            errors.push({ index: i + 1, message: `valore [${formatted[i]}] non consentito` });
        }
        if (i === ATECO_CODE && formatted[ATECO_CODE] === undefined && formatted[i] !== undefined) {
            errors.push({ index: i + 1, message: `valore [${formatted[i]}] non consentito` });
        }
        if (i === ATECO_DESC && formatted[ATECO_DESC] === undefined && formatted[i] !== undefined) {
            errors.push({ index: i + 1, message: `valore [${formatted[i]}] non consentito` });
        }
    }
    return { formatted: formatted, errors: errors };
}

onChange(async (files) => {
    if (!files) return;
    let file = files[0];
    let content = await file.text();
    let data = csv.parsePositional(content);
    console.log(data);
    let docValidation: ValidationRowResult[] = [];
    for (let i = 0; i < data.length; i++) {
        const { formatted, errors } = validateAndFormatRow(data[i]);
        data[i] = formatted;
        docValidation.push(new ValidationRowResult(i + 1, formatted, errors));
    }
    validationResults.value = docValidation;
    dittaRows.value = data;
    // console.log(await file.text());
});
</script>

<style lang="css" scoped>
.conto-table {
    @apply outline-none border-none !important;

    th {
        @apply border-t-0 border-l-0 border-r-0 border-b-[2px] border-outline bg-transparent !important;
    }

    td {
        @apply outline-none border-[1px] !important;
    }
    tr:hover {
        @apply bg-background !important;
    }

    tr {
        @apply outline-none !important;
    }
}
</style>
