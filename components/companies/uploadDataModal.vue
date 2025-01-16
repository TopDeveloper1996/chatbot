
<template>
  <div class="flex flex-col" v-if="show">
    <div class="flex flex-col gap-2">
      <div class="flex flex-row items-center">
          <h1 class="text-2xl font-bold"> Upload Dati Addizionali</h1>
      </div>
      <div class="divider"></div>
      <div>
        <div v-if="isUploading" class="flex justify-center w-full">
            <div class="flex items-center flex-row gap-2">
                <icon class="size-6" name="line-md:loading-twotone-loop"></icon>
                <p v-if="progress <= 60" class="">Caricamento del file ...</p>
                <p v-if="progress > 60" class=""> Il File e stato caricato </p>
                <span>{{ progress }}%</span>
            </div>
        </div>
        <div v-if="isUploading" class="progress">
            <div 
              class="progress-bar"
              :style="{ width: `${progress}%` }"
            ></div>
            <span>{{ progress }}%</span>
        </div>
        <div 
            v-if="errorMessage" 
            class="error-message"
          >
            {{ errorMessage }}
        </div>
    
          <div class="modal-content flex flow-root">
              <div class="download-section">
                <button class="float-left primary-button btn-download" @click="downloadexcelTemplate" :disabled="isUploading">
                    <div class="flex flex-col gap-2 items-center">
                        <div class="flex flex-row gap-2 items-center">
                            <p >Download File Di Esempio</p>
                          
                            <icon name="material-symbols:copy" class="size-10"></icon>
                        </div>
                    </div>
                              
                </button>
              </div>
              <div class="upload-section">
                <input 
              type="file"
              ref="fileInput"
              @change="handleFileSelect"
              accept=".xlsx"
              :disabled="isUploading" 
              multiple
            >
                <button class="float-right primary-button btn-upload"
              @click="$refs.fileInput.click()"
              :disabled="isUploading">
                      <div class="flex flex-col gap-2 items-center">
                          <div class="flex flex-row gap-2 items-center">
                            
                              <p >Carica File Excel</p>
                              <icon name="material-symbols:copy" class="size-10"></icon>
                          </div>
                      </div>
                </button>
              </div>
          </div>
       
     
      </div>
      

    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
const ditta360upload = useDitta360DataUploadStore();
const { state } = storeToRefs(ditta360upload);
const { uploadData, downloadTemplateFromAzure } = ditta360upload;
const props = defineProps<{ show: boolean, cpa: any }>();
const show = props.show
const cpa = props.cpa
const ditta = props.cpa.dittas?.selected
const fileInput = ref(null)
const isUploading = computed(() => state.value.isUploading)
const progress = computed(() => state.value.progress)
const errorMessage = computed(() => state.value.errorMessage)
const { $notifications } = useNuxtApp();

const emit = defineEmits(['upload-complete','close']);
const handleFileSelect = async (event: any) => {
      // const file = event.target.files[0]
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file || !cpa || !ditta) return;
      // if (!['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/wps-office.xlsx'].includes(file.type)) {
      //   alert('Please select an Excel file.');
      //   showError("Please select an Excel file")
      //   fileInput.value =  null;
      //   return;
      // }
      
      const formData = new FormData();
      formData.append('file', file);
      try {
        
        // await uploadData(formData, cpa.getData.blobContainerName, ditta.registered_name, file.name, ditta.id, cpa.getData.id);
        const result = await uploadData({
        formData: formData, 
        containerName: cpa.getData.blobContainerName, 
        ditta_name: ditta.registered_name.trim(), 
        filename: file.name, 
        dittaId: ditta.id, 
        cpaId: cpa.getData.id, 
    });
        if (result?.success) {
          showSuccess(" Il File e stato caricato")
          
        }
        else {
          showError(state.value.errorMessage)
          }
        
        emit('upload-complete')
        close()
      } catch (error) {
        console.error('Upload failed:', error)
      }
    }


// Success notification
const showSuccess = (message: string) => {
  $notifications.add({
    id: 'uploaded-success-notification',
    message: message,
    icon: "material-symbols:check",
    type: 'success',
    timeout: 15000
  })
}

// Error notification
const showError = (message: string) => {
  $notifications.add({
    id: 'uploaded-error-notification',
    message: message,
    icon: "material-symbols:error-circle-rounded",
    type: 'error',
    timeout: 15000
  })
}

// Info notification
const showInfo = (message: string) => {
  $notifications.add({
    id: 'uploaded-info-notification',
    message: message,
    type: 'info',
    timeout: 15000
    // No timeout - must be dismissed manually
  })
}
const downloadexcelTemplate = () => {
  downloadTemplateFromAzure();
  showSuccess("Il file modello viene scaricato")
    }

const close = () => {
      // emit('close')
      fileInput.value =  null
    }

</script>

<style lang="css" scoped>



.modal-content {
  padding: 20px;
 
  display: flex;
}

.upload-section {
  flex-direction: column;
  gap: 10px;
  width: 50%;
}

.download-section {
  flex-direction: column;
  gap: 10px;
  width: 50%;
}

input[type="file"] {
  display: none;
}

.progress {
  margin-top: 20px;
  background: #eee;
  height: 20px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  background: #4CAF50;
  height: 100%;
  transition: width 0.3s ease;
}

.error-message {
  color: red;
  margin-top: 10px;
}

/* button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
} */

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-download {
  background: #2196F3;
  color: white;
  width: 50%;
  height: 200%;
  font-size: 25px;
}

.btn-upload {
  background: #1227e2;
  color: white;
  width: 50%;
  height: 200%;
  font-size: 25px;
}

</style>