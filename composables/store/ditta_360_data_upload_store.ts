

import { IncomeStatementuploadData } from "~/src/types/income_statement_types";
import csvTemplate from '@/public/ditta-360-data-input-template.xlsx?url'
import l from "lodash";
import axios from "axios";
export const useDitta360DataUploadStore = defineStore("ditta_360_data_upload", () => {
    
    const state = ref<IncomeStatementuploadData>({isUploading:false, errorMessage: '', progress: 0});
  
    const endpoints = useEndpoints();
    const { api } = useApi();
    const config = useAppConfig();
    const set_upload_status = (state: any, status: boolean) =>{
      state.value.isUploading = status
    }
    const set_progress = (state: any, progress: number) =>{
      state.value.progress = progress
    }
    const set_error_message = (state: any, message: string) =>{
      state.value.errorMessage = message
    }
    async function sleep(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
    const uploadData = async({
        formData, 
        containerName, 
        ditta_name, 
        filename, 
        dittaId, 
        cpaId, 
    }: {
        formData: FormData; 
        containerName: string; 
        ditta_name: string; 
        filename: string; 
        dittaId: number; 
        cpaId: number;
      }) => {
      const hasError = false
      try {
          if (!formData) throw new Error('excel file is not uploaded by user');
          if(!containerName || !ditta_name.trim() || !filename || !dittaId || !cpaId) throw new Error('Missing required upload data');
          set_upload_status(state, true)
          set_progress(state, 10)
          set_error_message(state, '')
          let file_size=0;
          let file_type='';
          
          // const new_filename = 'test-'+new Date().getTime()+'-'+filename;
          ditta_name = l.trimEnd(ditta_name.trim(), '.');
          const new_filename = `test-${new Date().getTime()}-${filename}`;
          const full_file_Path = `adeMentally/ditta360_Uploaded_Files/${ditta_name}/${new_filename}`;
          formData.append('filePath', full_file_Path);
          formData.append('containerName', containerName);
          try{
            file_size = formData.get('file')?.size;
            file_type = formData.get('file')?.type;
          }
          catch(ex){
            console.log(ex)
          }
          // return
            // Send request to backend to get the file stream
          set_progress(state, 30)
          // const response = await fetch(endpoints.azureBlobHandler, {
          //       method: 'POST',
          //       headers: {
          //           'Authorization': `Bearer ${config.auth}`
          //       },
          //       body: formData
          //   });
          let upload_blob = await api(endpoints.azureBlobHandler, { 
              method: "POST",
              headers: {
                'Authorization': `Bearer ${config.auth}`
            },
              body: formData
            });
            const upload_blob_response = await upload_blob;
           
            // if(response.ok){
              set_progress(state, 60)
              console.log('Successfully uploaded file to azure storage');
              let insert_upload_log = await api(endpoints.ditta360UploadLog, { 
                method: "POST",
                query: { 
                  dittaId: dittaId,
                  customerId: cpaId,
                  fileName: new_filename,
                  filePath: full_file_Path,
                  fileType: file_type,
                  fileSize: file_size

                } 
              });
              const insert_response = await insert_upload_log;
              if (insert_response?.data?.id){
                set_progress(state, 70)
                console.log('Successfully inserted log record for uploaded data with id: ', insert_response.data.id);
                set_progress(state, 80)
                await callUploadExcelProcessor({dittaId: dittaId, customerId: cpaId, uploadedId: insert_response.data.id});
                
              }
              else {
                console.error('Failed to insert log for uploaded file:');
                return;
            }
              
            // }
            // if (!response.ok) {
            //     console.error('Failed to upload file:', response.statusText);
            //     return;
            // }
          
          set_progress(state, 100)
          set_error_message(state, '')
          await sleep(500);
          


      } catch (error) {
        console.error('Failed to upload file:', error);
        set_error_message(state, `Failed to upload file: ${error}`)
        throw error
      }
      finally {
        set_upload_status(state, false)
        set_progress(state, 0)
      }
      if (!hasError) {
        return {success: true};
      }
      set_error_message(state, `Unknown error: Failed to upload file`)
      return {success: false};
    }

    const callUploadExcelProcessor = async({dittaId, customerId, uploadedId}: {dittaId: number, customerId: number, uploadedId: number}) => {
      try {
        const postData = {
          uploadedId: uploadedId,
        };

        let process_upload = await api(endpoints.ditta360UploadDataProcessor, { 
          method: "POST",
          query:postData
        });
        const process_response = await process_upload;

       
        // console.log(`Excel Processing API status: ${process_response.status}`);
        // console.log(`Excel Processing API response: ${process_response.data.res}`);
        console.log(`Excel Processing API response: ${JSON.stringify(process_response.data.res)}`);
        // console.log(process_response.data)
        return process_response.data.res;

      } catch (ex: any) {
        console.error(`Excel Processing API is down ${ex}`);
        throw new Error("Excel Processing API is down");
        
      }
    }
    const downloadTemplate = async({}) => {
        try {

           
          const response = await fetch(csvTemplate);
          // const blob = new Blob([template], { type: 'text/csv' });
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'income-statement-template.xlsx';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

        } catch (error) {
          console.log(error)
          set_error_message(state, 'Failed to download template')
          throw error
        }
      }
    const downloadTemplateFromAzure = async (): Promise<void> => {
        const file_Path = 'Conto-Economico-new-template-income-statement.xlsx'
        try {
            // Send request to backend to get the file stream
            // const response = await fetch(endpoints.azureBlobHandler, {
            //     method: 'PUT',
            //     headers: {
            //         'Authorization': `Bearer ${config.auth}`
            //     },
            //     body: JSON.stringify({filePath: file_Path, containerName: 'ade-mentally-resources'})
            // });
            let download_template_blob = await api(endpoints.azureBlobHandler, { 
              method: "PUT",
              headers: {
                'Authorization': `Bearer ${config.auth}`
            },
              body: JSON.stringify({filePath: file_Path, containerName: 'ade-mentally-resources'})
            });
            const download_template_blob_response = await download_template_blob;


            // Convert response stream to Blob
            // const blob = await response.blob();
            console.log(download_template_blob_response)
            const blob = await download_template_blob_response;
            
            // Create a URL for the Blob
            const url = window.URL.createObjectURL(blob);

            // Create an anchor element and trigger download
            const a = document.createElement('a');
            a.href = url;
            a.download = file_Path.split('/').pop() ?? ''; // Extract filename from path
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            set_error_message(state, 'Error downloading file')
            console.error('Error downloading file:', error);
        }
    };
    return {state,
        uploadData,
        set_upload_status,
        set_progress,
        set_error_message,
        downloadTemplate,
        downloadTemplateFromAzure
        };
});
