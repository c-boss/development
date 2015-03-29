package org.fileuploads;

import java.util.List;

import javax.faces.bean.ManagedBean;




@ManagedBean
public class FileUploadBean {

	private List<UploadedFile> files;
	
	public List<UploadedFile> getFiles() {
		return files;
	}
	public void setFiles(List<UploadedFile> files) {
		this.files = files;
	}
	
	 
}
