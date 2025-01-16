# Stores

Stores are a fundamental concept in Nuxt and Vue. Basically they represent a method to handle persistent data through various screen, also known as state management. The state manager used for AdeMentally is [Pinia](https://pinia.vuejs.org/).  
Stores are defined in the [store folder](/composables/store/).

## Operational stores

These stores are tightly linked to the core functionality of AdeMentally.

### [Invoice store](/composables/store/invoices_store.ts)

The invoice store is responsible for fetching the invoices data from the MongoDB, aggregate it and remap the data to suitable data structures ready to be used in the frontend. These structures are defined in the [invoice_store_types.ts](/src/types/invoice_store_types.ts).

This store contains all the logic for computing and aggregating the invoices. Hence for any change to the business logic, simply operate in this file.

### [F24 store](/composables/store/f24_store.ts)

The F24 store is responsible for fetching the F24 data from the MongoDB, aggregate it and remap the data to suitable data structures ready to be used in the frontend. These structures are defined in the [f24_store_types.ts](/src/types/f24_store_types.ts).

This store contains all the logic for computing and aggregating the F24 documents. Hence for any change to the business logic, simply operate in this file.

### [CPA store](/composables/store/cpa_store.ts)

The CPA store is responsible for handling authentication session for the current CPA and to handle dittas data.
