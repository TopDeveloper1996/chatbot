<template>
    <div v-if="mounted" class="flex flex-col h-screen w-full">
        <h1 class="view-title">Assistente I.A.</h1>
        <DropdownMenu id="agent_type_dropdown" class="w-[8rem]" :items="Object.values(Agent)"
            :items-formatter="(e: any) => wordCapitalize(e) ?? ''" close-on-click
            :label="wordCapitalize(selectedAgent) ?? ''" @change="(e: any) => (selectedAgent = e)"></DropdownMenu>
        <div class="flex flex-grow w-[100%] overflow-hidden">
            <div ref="chatEl" class="chat-box flex-grow overflow-y-auto">
                <TransitionGroup name="list" tag="ul" class="flex flex-col gap-2 items-stretch">
                    <!-- <li class="flex flex-col" :style="{ '--tr': item.agent === ChatRole.user ? '30px' : '-30px' }"
                        :class="[item.agent === ChatRole.user ? 'items-end' : 'items-start']" v-for="item of messages"
                        :key="item.time.getTime()"> -->
                    <li class="flex flex-col items-start"
                        :style="{ '--tr': item.agent === ChatRole.user ? '30px' : '-30px' }" v-for="item of messages"
                        :key="item.time.getTime()" :index="item.id" @click="handleMessageId(item.id)">
                        <AssistantChatBubble :item="item"></AssistantChatBubble>
                    </li>
                </TransitionGroup>
                <ul class="flex flex-col items-center gap-2"></ul>
            </div>
            <div class="bg-gray-800 w-[50%] rounded-xl bg-surface p-2 flex flex-col gap-2 overflow-y-auto">
                <template v-if="currentContexts.length > 0">
      <CollapsiblePanel 
        v-for="(panel, index) in currentContexts" 
        :key="index" 
        :title="panel.title"
        :link="panel.link" 
        @ShowContent="handleShowContentEvent" 
        :id="'' + index"
      >
        <p>{{ panel.content }}</p>
      </CollapsiblePanel>
    </template>
    <template v-else>
      <p class="text-center text-gray-400 py-4">There is no context data</p>
    </template>
            </div>
        </div>
        <div class="flex flex-row p-2 rounded-xl items-center gap-2">
            <input @keyup="(ev) => { if (ev.key === 'Enter') pushUserMessage(); }" v-model="typeContent" type="text"
                placeholder="Chiedi qualcosa" class="flex-grow p-2 rounded-xl border" />
            <button @click="pushUserMessage" class="hover:bg-surface hover:text-accent rounded-xl p-2">
                <icon class="size-8" name="material-symbols:send-rounded"></icon>
            </button>
        </div>
        <Modal :visible="isModalVisible" @close="closeModal" @download="download_blob" :title="modalTitle" :loading="isModalLoading">
            <pre class="text-black">
                {{ modalContent }}
            </pre>
        </Modal>
    </div>
</template>

<script lang="ts" setup>
import { constant, uniqueId } from "lodash";
import { Context, ArticleContent } from "~/src/types/ai_agent_types";

const selectedAgent = ref<Agent>(Agent.default);
const cpa = useCpa();

const mounted = useMounted();
const contexts = ref<Context[][]>([]);
const messages = ref<ChatMessage[]>([]);
const typeContent = ref<string | undefined>();
const chatEl = ref<HTMLElement | undefined>(undefined);
const { api } = useApi();
const assistant = useAssistant();

const current_message_id = ref<string | undefined>();

const chat_logger = useChatLogger();
const blob_reader = useBlobReader();
const blob_downloader = useBlobDownloader();

const ArticleContents = ref<ArticleContent[] | undefined>([]);

const isModalVisible = ref(false);
const isModalLoading = ref(false);
const modalTitle = ref<string>();
const modalContent = ref<string>();
const modalBlobLink = ref<string>();
async function handleShowContentEvent(message: any) {
    isModalVisible.value = !(isModalVisible.value);
    isModalLoading.value = true;
    modalTitle.value = message[0];
    await blob_reader.read(
        message[0],
        message[1]
    ).then((res) =>{
        isModalLoading.value = false;
        modalContent.value = (res && res.length > 0) ? res[0].content : "Non c'è anteprima per questo articolo";
        modalBlobLink.value = (res && res.length > 0) ? res[0].blob_link : undefined;
    }).catch(error => {
        modalContent.value = "Errore interno del server";
    });
}
function closeModal(){
    isModalVisible.value = !(isModalVisible.value);
    isModalLoading.value = false;
}

async function download_blob(){
    await blob_downloader.download(modalBlobLink.value).catch(error => {
        console.log("blob downloading was failed.");
    });
}

function pushUserMessage() {
    if (!typeContent.value || typeContent.value.length <= 0) return;
    messages.value.push({
        id: uniqueId(),
        content: typeContent.value,
        icon: "material-symbols:android-contacts",
        time: new Date(),
        type: ChatMessageType.text,
        agent: ChatRole.user,
    });
    setTimeout(() => chatEl.value?.scroll({ top: chatEl.value.scrollHeight, behavior: "smooth" }), 0);

    chat_logger.save(
        cpa.getData.id,
        ChatRole.user,
        typeContent.value,
        []
    ).catch(error => {
        console.error('Error saving chat:', error);
    });

    engageAi(typeContent.value);
    typeContent.value = undefined;
}

async function engageAi(prompt: string | undefined) {
    if (!prompt) return;
    let id = uniqueId();
    let response = <ChatMessage>{
        id: id,
        content: "",
        icon: "mdi:robot",
        time: new Date(),
        type: ChatMessageType.text,
        agent: ChatRole.assistant,
        loading: true,
    };
    messages.value.push(response);
    const stream = await assistant.answer(
        prompt,
        messages.value.slice(messages.value.length - 10, messages.value.length - 1).map((m) => ({
            role: m.agent,
            content: m.content ?? "",
        })),
        selectedAgent.value
    );
    const match = messages.value.find(m => m.id === id); // Replace someId with the actual ID

    if (match) {
        current_message_id.value = match.id;
    } else {
        console.error("Did not find a match");
    }
    if (!match) {
        console.error("did not find a match");
        return;
    }
    if (!stream) {
        match.content = "Spiacenti, ma ho riscontrato un errore e non posso risponderti al momento";
        match.loading = false;
        return;
    }
    let currentContent = "";
    let exit = false;
    let reader = stream.getReader();
    let foundContexts = false;
    let tempContent = ""

    const processContent = (content:string) => {
        if (foundContexts) {
            match.content += content;
        } else if (content.includes(']## Risposta')) {
            tempContent += content;
            const [contextsString, remainingContent] = tempContent.split(']## Risposta');
            try {
                contexts.value.push(JSON.parse(contextsString + ']'));
            } catch (e) {
                console.error('Invalid JSON format:', e);
            }
            match.content = '## Risposta' + remainingContent;
            foundContexts = true;
        } else {
            tempContent += content;
        }
    };

    do {
        const { value, done } = await reader.read();
        if (value) {
            currentContent += value;
            if (currentContent.length > 24 || done) {
                processContent(currentContent);
                currentContent = '';
            }
        }
        exit = done;
    } while (!exit);
    chat_logger.save(
        cpa.getData.id,
        match.agent,
        match.content,
        contexts.value.at(-1)
    ).catch(error => {
        console.error('Error saving chat:', error);
    });
    match.loading = false;
    setTimeout(() => chatEl.value?.scroll({ top: chatEl.value.scrollHeight, behavior: "smooth" }), 0);
}

const currentContexts = computed(() => {
    const index = current_message_id.value !== undefined
        ? Math.floor(parseInt(current_message_id.value) / 2) - 1
        : 0; // Default index if undefined
    return contexts.value[index] || [];
});

function handleMessageId(id: string | undefined) {
    if (id !== undefined) {
        current_message_id.value = parseInt(id) + 1 + "";
    } else {
        console.error("ID is undefined");
        // Handle the undefined case, maybe set a default value
    }
}
</script>

<style lang="css" scoped>
.chat-box {
    @apply flex-1 overflow-y-auto my-8 max-w-full;
}

.list-enter-active,
.list-leave-active {
    transition: all 0.25s ease-out;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateX(var(--tr, 0));
}
</style>
