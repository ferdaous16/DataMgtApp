import { supabase } from '../supabaseClient';

export const DocumentService = {
  async uploadDocument(file, metadata) {
    try {
      const employeeId = metadata.employeeId;
      const fileName = `${employeeId}/${Date.now()}_${file.name}`;
      const file_path = `documents/${employeeId}/${Date.now()}_${file.name}`;
      
      const { data: fileData, error: fileError } = await supabase.storage
        .from('documents')
        .upload(file_path, file);
      
      if (fileError) throw fileError;
      
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          file_name: file.name,
          file_path: file_path,
          file_type: file.type,
          document_type: metadata.documentType,
          uploaded_by: metadata.uploadedBy,
          employee_id: employeeId,
          confidential: metadata.confidential || false
        });
      
      if (docError) throw docError;
      
      return { fileData, docData };
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },
  
  async getDocuments(searchParams = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      const isHrManager = userProfile?.role === 'HR Manager';
      
      let query = supabase
        .from('documents')
        .select(`
          id,
          file_name,
          file_path,
          file_type,
          document_type,
          uploaded_by,
          employee_id,
          created_at,
          updated_at,
          confidential,
          profiles:profiles!documents_employee_id_fkey (first_name, last_name, email)

        `);
      
      if (searchParams.documentType) {
        query = query.eq('document_type', searchParams.documentType);
      }
      
      if (searchParams.employeeId) {
        query = query.eq('employee_id', searchParams.employeeId);
      }
      
      if (searchParams.fileName) {
        query = query.ilike('file_name', `%${searchParams.fileName}%`);
      }
      
      if (searchParams.dateFrom) {
        query = query.gte('created_at', searchParams.dateFrom);
      }
      
      if (searchParams.dateTo) {
        query = query.lte('created_at', searchParams.dateTo);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },
  
  async getDocumentUrl(file_path) {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(file_path, 60); // Ensure signed URL is generated with a token
      
      if (error) throw error;
      
      if (!data?.signedUrl) {
        throw new Error('Failed to generate signed URL');
      }
      
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting document URL:', error);
      throw error;
    }
  },
  
  async deleteDocument(documentId) {
    try {
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .single();
      
      if (fetchError || !document) throw new Error('Document not found');
      
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);
      
      if (storageError) throw storageError;
      
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
      
      if (deleteError) throw deleteError;
      
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
};
