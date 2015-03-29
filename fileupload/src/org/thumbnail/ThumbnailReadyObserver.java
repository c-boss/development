package org.thumbnail;

import java.awt.Image;
import java.awt.image.ImageObserver;

/**
 * Not quite sure if this is necessary:
 * This is intended to give awt a chance to draw image asynchronously.
 * 
 * @author Benjamin
 */
public class ThumbnailReadyObserver implements ImageObserver {

	private Thread toNotify;
	
	/** The logger for this class */
	
	public volatile boolean ready = false;
	
	public ThumbnailReadyObserver(Thread toNotify)
	{
		this.toNotify = toNotify;
		ready = false;
	}
	
	public boolean imageUpdate(Image img, int infoflags, int x, int y, int width, int height) {
		
		if ((infoflags & ImageObserver.ALLBITS) > 0)
		{
			ready = true;
			toNotify.notify();
			return true;
		}
		return false; 
	}
}
