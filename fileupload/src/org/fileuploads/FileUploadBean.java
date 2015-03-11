package org.fileuploads;

import java.util.List;

import javax.faces.bean.ManagedBean;

import org.primefaces.event.FileUploadEvent;




@ManagedBean
public class FileUploadBean {

	private List<UploadedFile> files;
	
	public List<UploadedFile> getFiles() {
		return files;
	}
	public void setFiles(List<UploadedFile> files) {
		this.files = files;
	}
	
	public void upload(FileUploadEvent event) {      
        System.out.println("file name"  + event.getFile().getFileName());
 
    }  
}
