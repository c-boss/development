package org.fileuploads;

import java.io.IOException;
import java.util.Collection;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

@WebServlet("/FileUploadServlet")
@MultipartConfig(maxFileSize=1024 * 1024 * 10 * 10 , maxRequestSize=1024 * 1024 * 10 * 10 , fileSizeThreshold = 1024 * 1024 * 10)
public class FileUploadServlet extends HttpServlet {

	
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		// TODO Auto-generated method stub
		System.out.println("file uploads ....");
		
		Collection<Part> parts=req.getParts();
		for (Part part : parts) {
			System.out.println(part.getName());
		}
	}
}
