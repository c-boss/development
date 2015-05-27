/*

Copyright (c) 2009 Anant Garg (anantgarg.com | inscripts.com)

This script may be used for non-commercial purposes only. For any
commercial purposes, please contact the author at 
anant.garg@inscripts.com

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/
var iconsName = [
		      
		            {name:'laugh',value:':D'},
		            {name:'sad',value:':('},
		            {name:'angle',value:'O)'},
		            {name:'tongue',value:':P'},
		            {name:'like',value:'(Y)'},
		            {name:'angry',value:':@'},
		            {name:'smile',value:':)'},
		            {name:'devil',value:'3)'},
		            {name:'bye',value:'(^.^)/~~'},
		            {name:'dizzy',value:'%-}'},
		            {name:'shouting',value:':sho'},
		            {name:'thinking',value:':-?'},
		            {name:'cloon',value:':o)'},
		            {name:'ghost',value:'(>")>'},
		            {name:'cat',value:'=^.^='},
		            {name:'music',value:'(m)'},
		            {name:'cry',value:":'("},
		            {name:'cake',value:':ca'},
		            {name:'boom',value:':bo'},
		            {name:'clock',value:'(o)'},
		            {name:'envelop',value:':en'},
		            {name:'idea',value:':id'},
		            {name:'cup',value:'|_|'},
		            {name:'sick',value:'+o('},
		            {name:'shutup',value:':sh'},
		            
		];

var wsUri = "ws://"+window.location.host+"/mearaj/websocketChat";
var websocket = new WebSocket(wsUri);


var chatTo;

var windowFocus = true;
var username=document.getElementById("userId").value;
var userJihadiName=document.getElementById("userJihadiName").value;
var chatHeartbeatCount = 0;
var minChatHeartbeat = 1000;
var maxChatHeartbeat = 33000;
var chatHeartbeatTime = minChatHeartbeat;
var originalTitle;
var blinkOrder = 0;

var chatboxFocus = new Array();
var newMessages = new Array();
var newMessagesWin = new Array();
var chatBoxes = new Array();

var ChatBoxesStorage=function(){
	this.boxes=new Array();
	this.setBoxes=function(boxes){
		this.boxes=boxes;
	}
}
ChatBoxesStorage.prototype.addBox=function(box){
	this.boxes.push(box);
}
ChatBoxesStorage.prototype.getBoxById=function(id){
	for (var i = 0; i < this.boxes.length; i++) {
		var item=this.boxes[i];
		if(item.id===id){
			return item;
		}
	}
}

ChatBoxesStorage.prototype.removeBoxById=function(id){
	for (var i = 0; i < this.boxes.length; i++) {
		var item=this.boxes[i];
		if(item.id===id){
			this.boxes.splice(i, 1);
		}
	}
}

var Message=function(text , type , date,sender){
	this.text=text;
	this.type=type;
	this.date=date;
	this.sender=sender;
}
var ChatBoxObj=function(id,chatWith,status){
	this.id=id;
	this.chatWith=chatWith;
	this.status=status;
	this.messages=new Array();
}
ChatBoxObj.prototype.addMessage=function(message){
	this.messages.push(message);
}

function clearChatState(data){
	
	sessionStorage['chatState']="";
}
function saveChatState(){
	sessionStorage['chatState'] = JSON.stringify(chatBoxesStorage);
}

function loadChatState(){
	
    
	
	if (sessionStorage['chatState']) {
		var data = JSON.parse(sessionStorage['chatState']);
		for (var i = 0; i < data.boxes.length; i++) {
			var item=data.boxes[i];
			var chatBoxObj=new ChatBoxObj(item.id, item.chatWith,item.status);
			for (var j = 0; j < item.messages.length; j++) {
				chatBoxObj.addMessage(item.messages[j]);
			}
			
			chatBoxesStorage.addBox(chatBoxObj);
		}
		
		
		
		for (var i = 0; i < data.boxes.length; i++) {
			
			var item=data.boxes[i];
			
			chatWith(item.id,item.chatWith);
			
			for (var j = 0; j < item.messages.length; j++) {
				var message=item.messages[j];
				if (message.type == "send") {
					
					
					$("#chatbox_" + item.id + " .chatboxcontent")
					.append(
							'<div class="chatboxmessage send-message"><div class="chatboxmessagecontent">'
									+ message.text + '</div><div class="chatboxmessagedate">'
									+ message.received + '</div></div>');

					$("#chatbox_"+ item.id+" .chatboxcontent").scrollTop($("#chatbox_"+item.id+" .chatboxcontent")[0].scrollHeight);
				}
				else if (message.type == "receive") {
					
					var image=$(".open-chatbox[data-user-id='"+message.sender+"']").find('img').clone();
					var senderName=$(".open-chatbox[data-user-id='"+message.sender+"']").attr("data-user-name");
					var chatboxmessage=$("<div class='chatboxmessage receive-message'></div>");
					var chatboxmessagefrom=$("<div class='chatboxmessagefrom'></div>");
					chatboxmessagefrom.appendTo(chatboxmessage);
					var sender=$("<div class='sender' data-role='tooltip' data-placement='left' data-toggle='tooltip' data-original-title='"+senderName+"'></div>");
					sender.appendTo(chatboxmessagefrom);
					var chatboxmessagecontent=$("<div class='chatboxmessagecontent'></div>").text(message.text);
					chatboxmessagecontent.appendTo(chatboxmessage);
					$("#chatbox_" + item.id + " .chatboxcontent")
							.append(chatboxmessage);
					sender.append(image);
					$("#chatbox_"+ item.id+" .chatboxcontent").scrollTop($("#chatbox_"+item.id+" .chatboxcontent")[0].scrollHeight);
					
					$("[data-role='tooltip']").each(function(){
						$(this).tooltip({
							container : "body"
						})
					})

				}
			}
			

			if(item.status=="closed"){
				$("#chatbox_"+item.id).hide();
			}
			else if(item.status=="minimized"){
				$('#chatbox_'+item.id+' .chatboxbody').css('display','none');
			}
			
		}
	}

}
var chatBoxesStorage=new ChatBoxesStorage();

var chatBoxCount=0;

$(document).ready(function(){
	
	var availableSize=$(window).width()-210;
	chatBoxCount=parseInt(Math.floor(availableSize/230))-1;
	
	loadChatState();
	
	originalTitle = document.title;
	

	
	$([window, document]).blur(function(){
		windowFocus = false;
	}).focus(function(){
		windowFocus = true;
		document.title = originalTitle;
	});
	
	
	$(".search-chat-input").keyup(function(){
		var query=$(this).val();
		
		$('.chat-menu ul li').each(function(){
			
			var name=$(this).attr("title");
			if(name.indexOf(query)==-1){
				$(this).css("display","none");
			}
			else{
				$(this).css("display","block");
			}
		});
	});
	
	
	$(".close-all-chatboxes").on("click",function(e){
		$(".chatbox").each(function(){
			$(this).hide();
		});
		$(".chat-overflow ul li").each(function(){
			$(this).remove();
		});
		$(".menu-count").html(0);
		$(".show-hided-chats").hide();
		chatBoxesStorage=new ChatBoxesStorage()
		saveChatState();
	    e.preventDefault();
	
	});
	$(".minimize-all-chatboxes").on("click",function(e){
		$(".chatbox").each(function(){
			$(this).find('.chatboxbody').css('display','none');
		});
		
	 e.preventDefault();
	
	});
	$(".show-only-online-users").on("click",function(e){
		$(".open-chatbox").each(function(){
			$(this).find(".offline").parents("li:first").hide();
		}
		);
	 e.preventDefault();
	
	});
	$(".show-all-users").on("click",function(e){
		$(".chat-list  li").each(function(){
			$(this).show();
		}
		);
	 e.preventDefault();
	
	});
	
	$(".emotions").live("click",function(e){
		console.log("emotions clicked ");
		var tbody=$("<tbody/>");
		var table=$('<table class="table-icons"></table>');
		
		tbody.appendTo(table);
		
		 for(var i = 0; i < 5; i++){
	          
	            var tr = $('<tr ></tr>');
	            for(var j=0;j<5;j++){
	            	var td=$('<td></td>');
	            	var icon=$("<a class='emoticon-icon' title='"+iconsName[i*5+j].value+"'></a>").addClass(iconsName[i*5+j].name).attr("data-icon-code",iconsName[i*5+j].value);
	            	icon.appendTo(td);
	            	td.appendTo(tr);
	            }
	            tr.appendTo(tbody);
		 }
	            
		var self=$(this);
		var parentChatbox=self.parents(".chatbox");
		
		 self.popover({
             animation: false,
             trigger: 'trigger',
             html: true,
             content:table,
             container: 'body',
             placement: "top"
         }).on('shown.bs.popover', function () {
        	 
        	 table.find(".emoticon-icon").click(function(){
             	var code=$(this).attr("data-icon-code");
             	parentChatbox.find(".chatboxtextarea").val(parentChatbox.find(".chatboxtextarea").val()+" "+code);
             	parentChatbox.find(".chatboxtextarea").focus();
             	self.popover("destroy");
             	return false;
              });
        	 
        	 $(document).click(function(e){
        			
        			if(!self.is(e.target) && self.has(e.target).length===0){
        				self.popover("destroy");
        			}
        		})
         });  
		 self.popover('toggle');
		 return false;
	});
	
	$(".open-hidden-chatbox").live('click',function(){
		var parent=$(this).parent();
		var usernamee=parent.attr("data-username");
		var id=parent.attr("data-id");
		chatWith(id,usernamee);
	   
		return false;
	});
	
    $(".show-hided-chats").live('click',function(){
    	$(this).parent().children("ul").toggle();
    	return false;
    });
	
	$(".close-chat-link").live('click',function(){
		var chatboxtitle=$(this).parent().attr("data-id");
		chatBoxesStorage.removeBoxById(chatboxtitle);
		saveChatState();
		$(this).parent().remove();
		$(".menu-count").html(parseInt($(".menu-count").html())-1);
		var newLength=$(".chat-overflow ul li").length;
		if(newLength==0){
			$(".show-hided-chats").hide();
			
		}
		return false;
	})
});

websocket.onopen = function(evt) {
	onOpen(evt);
};
websocket.onmessage = function(evt) {
	onMessage(evt);
};
websocket.onclose = function(evt) {
	onClose(evt);
};
websocket.onerror = function(evt) {
	onError(evt);
};

function onClose() {
	
	
	console.log("onclose");
	

}
function onOpen() {
	console.log("websocket opennnnnnnnn.....");
	
	

}

function onMessage(evt) {
	

	
	var msg = JSON.parse(evt.data); // native API
	
	msg.received=new Date();
	var received=msg.received;
	var sender = msg.sender;
	var senderName = msg.senderName;
	var receiver = msg.receiver;
	var receiverName=msg.receiverName;
	var type = msg.type;
	var messageText = msg.message;
	
	
	 if(type=="userChanged"){
		 $(".chat-list a[data-user-id='"+sender+"']").find("img").attr("src",messageText);
	 }
	
	
     
	 messageText=messageText.replace(/\(Y\)/g,'<span class="emoticon-icon like"></span>');
	 messageText=messageText.replace(/:D/g,'<span class="emoticon-icon laugh"></span>');
	 messageText=messageText.replace(/:\)/g,'<span class="emoticon-icon smile"></span>');
     messageText=messageText.replace(/:\(/g,'<span class="emoticon-icon sad"></span>');
     messageText=messageText.replace(/:@/g,'<span class="emoticon-icon angry"></span>');
     messageText=messageText.replace(/O\)/g,'<span class="emoticon-icon angle"></span>');
     messageText=messageText.replace(/3\)/g,'<span class="emoticon-icon devil"></span>');
     messageText=messageText.replace(/:P/g,'<span class="emoticon-icon tongue"></span>');
     messageText=messageText.replace(/\(\^\.\^\)\/~~/g,'<span class="emoticon-icon bye"></span>');
     messageText=messageText.replace(/%-\}/g,'<span class="emoticon-icon dizzy"></span>');
     messageText=messageText.replace(/:sho/g,'<span class="emoticon-icon shouting"></span>');
     messageText=messageText.replace(/:-\?/g,'<span class="emoticon-icon thinking"></span>');
     messageText=messageText.replace(/:o\)/g,'<span class="emoticon-icon cloon"></span>');
     messageText=messageText.replace(/\(>"\)>/g,'<span class="emoticon-icon ghost"></span>');
     messageText=messageText.replace(/\(m\)/g,'<span class="emoticon-icon music"></span>');
     messageText=messageText.replace(/:'\(/g,'<span class="emoticon-icon cry"></span>');
     messageText=messageText.replace(/:ca/g,'<span class="emoticon-icon cake"></span>');
     messageText=messageText.replace(/:bo/g,'<span class="emoticon-icon boom"></span>');
     messageText=messageText.replace(/\(o\)/g,'<span class="emoticon-icon clock"></span>');
     messageText=messageText.replace(/:en/g,'<span class="emoticon-icon envelop"></span>');
     messageText=messageText.replace(/:id/g,'<span class="emoticon-icon idea"></span>');
     messageText=messageText.replace(/\|_\|/g,'<span class="emoticon-icon cup"></span>');
     messageText=messageText.replace(/\+o\(/g,'<span class="emoticon-icon sick"></span>');
     messageText=messageText.replace(/:sh/g,'<span class="emoticon-icon shutup"></span>');
     messageText=messageText.replace(/=\^\.\^=/g,'<span class="emoticon-icon cat"></span>');
     
   
	
	if (type == "send") {
		
		chatWith(receiver,receiverName);
		var message=new Message(messageText,type,received,sender);
		chatBoxesStorage.getBoxById(receiver).addMessage(message);
		
		saveChatState();
		
		$("#chatbox_" + receiver + " .chatboxcontent")
		.append(
				'<div class="chatboxmessage send-message" title="'+moment(received).format("HH:mm:ss DD/MM")+'"><div class="chatboxmessagecontent">'
						+ messageText + '</div></div>');

		$("#chatbox_"+ receiver+" .chatboxcontent").scrollTop($("#chatbox_"+receiver+" .chatboxcontent")[0].scrollHeight);
	}
	
	else if(type=="online"){
		
		$("[data-user-id='"+sender+"']").children(".icon-circle").removeClass("offline").addClass("online");
		$("#chatbox_"+sender+" .chatboxtitle .icon-circle").removeClass("offline").addClass("online");
	}
	
	else if(type=="offline"){
		$("[data-user-id='"+sender+"']").children(".icon-circle").removeClass("online").addClass("offline");
		$("#chatbox_"+sender+" .chatboxtitle .icon-circle").removeClass("online").addClass("offline");
		
	}
	else if (type == "receive") {
		var senderImageId=sender;
		var image=$(".open-chatbox[data-user-id='"+senderImageId+"']").find('img').clone();
		var title=$(".open-chatbox[data-user-id='"+senderImageId+"']").attr("data-user-name");
		//if many user
		if(receiver.indexOf("_")!=-1){
			
			var receiverArray=receiver.split("_");
			for (var i = 0; i < receiverArray.length; i++) {
				var item=receiverArray[i];
				if(item===username){
					receiverArray.splice(i, 1);
				}
			}
			receiverArray.push(sender);
			
			sender="";
			for (var i = 0; i < receiverArray.length; i++) {
				sender+=receiverArray[i]+"_";
			}
			if(sender){
				sender=sender.slice(0,-1);
			}
			
			var receiverNamesArray=receiverName.split(",");
			for (var i = 0; i < receiverNamesArray.length; i++) {
				var item=receiverNamesArray[i];
				if(item===userJihadiName){
					receiverNamesArray.splice(i, 1);
				}
			}
			receiverNamesArray.push(senderName);
			senderName="";
			for (var i = 0; i < receiverNamesArray.length; i++) {
				senderName+=receiverNamesArray[i]+",";
			}
			if(senderName){
				senderName=senderName.slice(0,-1);
			}
			for (var i = 0; i < chatBoxes.length; i++) {
				if(compareTwoUnorderedStrings(chatBoxes[i],sender)){
					sender=chatBoxes[i];
				}
			}
			chatWith(sender,senderName);
		}
		//end many user chat onmessage
		else{
			
			chatWith(sender,senderName);
			
		}
		
		
		var message=new Message(messageText,type,received,senderImageId);
		chatBoxesStorage.getBoxById(sender).addMessage(message);
		
		saveChatState();
	
		var chatboxmessage=$("<div class='chatboxmessage receive-message'></div>");
		var chatboxmessagefrom=$("<div class='chatboxmessagefrom'></div>");
		chatboxmessagefrom.appendTo(chatboxmessage);
		var senderDiv=$("<div class='sender' data-role='tooltip' data-placement='left' data-toggle='tooltip' data-original-title='"+title+"'></div>");
		senderDiv.appendTo(chatboxmessagefrom);
		var chatboxmessagecontent=$("<div class='chatboxmessagecontent'></div>").html(message.text);
		chatboxmessagecontent.appendTo(chatboxmessage);
		$("#chatbox_" + sender + " .chatboxcontent")
				.append(chatboxmessage);
		senderDiv.append(image);
		$("#chatbox_"+ sender+" .chatboxcontent").scrollTop($("#chatbox_"+sender+" .chatboxcontent")[0].scrollHeight);

		

	}
	
	$('[data-role="tooltip"]').each(function(){
		$(this).tooltip({
			container:'body'
			
		});
	});
}

function onError(evt) {
    console.log("error");
}



function restructureChatBoxes() {
	align = 0;
	for (x in chatBoxes) {
		chatboxtitle = chatBoxes[x];

		if ($("#chatbox_"+chatboxtitle).css('display') != 'none') {
			if (align == 0) {
				$("#chatbox_"+chatboxtitle).css('right', '210px');
			} else {
				width = (align)*(230)+210;
				$("#chatbox_"+chatboxtitle).css('right', width+'px');
			}
			align++;
		}
	}
}

function chatWith(chatuser,chatUsername) {
	
	createChatBox(chatuser,chatUsername);
	$("#chatbox_"+chatuser+" .chatboxtextarea").focus();
}

function createChatBox(chatboxtitle,chatUsername) {
	 
if ($("#chatbox_"+chatboxtitle).length > 0) {
		
		if ($("#chatbox_"+chatboxtitle).css('display') == 'none') {
			
			//there is no space 
			if(checkEmptySpace()){
				var element=getOutMostElement();
				var width;
				if(!element){
					width =210;
				}
				else{
					width =pixelToNumber(element.css("right")) + 230;
				}
				
				$("#chatbox_"+chatboxtitle).css("right",width+"px");
			}
			else{
				
				var element=getOutMostElement();
				var width =pixelToNumber(element.css("right"));
				$("#chatbox_"+chatboxtitle).css("right",width+"px");
				element.hide();
				
				var length=$("li[data-id='"+chatboxtitle+"']").length;
				//not found in the small menu
				if(length==0){
					$(" <li />" )
					.attr("data-id",element.attr("data-id"))
					.attr("data-username",element.attr("data-username"))
					.html('<a href="#" class="open-hidden-chatbox">'+element.attr("data-username")+'</a> <a class="close-chat-link" href="#"><i class="icon-remove"></i></a>')
					.appendTo($( ".chat-overflow ul" ));
					$(".show-hided-chats").show();
					
					$(".menu-count").html(parseInt($(".menu-count").html())+1);
					
				}
				//found in the small menu
				else{
					console.log("found");
					$(" <li />" )
					.attr("data-id",element.attr("data-id"))
					.attr("data-username",element.attr("data-username"))
					.html('<a href="#" class="open-hidden-chatbox">'+element.attr("data-username")+'</a> <a class="close-chat-link" href="#"><i class="icon-remove"></i></a>')
					.appendTo($( ".chat-overflow ul" ));
					$(".show-hided-chats").show();
					
					$("li[data-id='"+chatboxtitle+"']").remove();
				}
				
			}
			
		}
		
		$("#chatbox_"+chatboxtitle).show();
        if($("#chatbox_"+chatboxtitle +" .chatboxbody").css('display')=="none"){
	        $("#chatbox_"+chatboxtitle +" .chatboxbody").show();
        }
		$("#chatbox_"+chatboxtitle+" .chatboxtextarea").focus();
		return;
	}
	
	
	
	//find whether user is online or offline 

    var userStatus;
    
    if(chatboxtitle.indexOf("_")!=-1){
    	userStatus="offline";
    }
    else{
    	var user=$(".chat-menu li a[data-user-id='"+chatboxtitle+"']");
    	
    	if(user.children(".icon-circle").hasClass("offline")){
    		userStatus="offline";
    	}
    	else{
    		userStatus="online";
    	}
    	
    }
    
    //only show multiuser btn if the chatbox is peer to peer
    var multiusersLink="";
    if(chatboxtitle.indexOf("_")==-1){
    	multiusersLink='<a href="javascript:void(0)" class="multi-users-link" ><i class="icon-plus"></i></a>';
    }
    
	

	//create a new chat box
	$(" <div />" ).attr("id","chatbox_"+chatboxtitle)
	.attr("data-username",chatUsername)
	.attr("data-id",chatboxtitle)
	.addClass("chatbox")
	.html('<div class="chatboxhead"><div class="chatboxtitle">'+chatUsername+'<span class="icon-circle '+userStatus+'"></span></div><div class="chatboxoptions">'+multiusersLink+' <a href="javascript:void(0)" onclick="javascript:closeChatBox(event , \''+chatboxtitle+'\')"><i class="icon-remove"></i></a></div><br clear="all"/></div><div class="chatboxbody"><div class="chatboxcontent"></div><div class="chatboxinput"><a class="emotions pop-over"><i class="icon-smile"></i></a><textarea class="chatboxtextarea" onkeydown="javascript:return checkChatBoxInputKey(event,this,\''+chatboxtitle+'\');"></textarea></div></div>')
	.appendTo($( "body" ));
	
	
	//append multiuser select menu
	var addUsersWrapper=$("<div></div>").addClass("multi-users-wrapper");
	
	var userSelectMenu=$(".users-selectmenu").find("select").clone();
	addUsersWrapper.append(userSelectMenu);
	$("<button class='btn btn-mini btn-info add-multiusers-btn'>موافق</button>").appendTo("<div class='multiusers-controls'></div>").appendTo(addUsersWrapper);
	$("#chatbox_"+chatboxtitle ).find(".chatboxcontent").append(addUsersWrapper);
	userSelectMenu.select2({
		placeholder : 'إختر الأسماء'
	});
	
	
	if(!chatBoxesStorage.getBoxById(chatboxtitle)){
		var chatbox=new ChatBoxObj(chatboxtitle,chatUsername,"opened");
		chatBoxesStorage.addBox(chatbox);
	}
	
	
	$("#chatbox_"+chatboxtitle).css('bottom', '0px');
	
	//if there is space
	if(checkEmptySpace()){
		
		var element=getOutMostElement();
		var width;
		if(!element){
			width =210;
		}
		else{
			width =pixelToNumber(element.css("right")) + 230;
		}
		
		$("#chatbox_"+chatboxtitle).css("right",width+"px");
	}
	//else there is no space so add the last to the small menu and show it 
	else{
		
		var element=getOutMostElement();
		var width =pixelToNumber(element.css("right"));
		$("#chatbox_"+chatboxtitle).css("right",width+"px");
		element.hide();
		
		//add the last to the small menu if it is not found
		var length=$("li[data-id='"+element.attr("data-id")+"']").length;
		if(length==0){
		$(" <li />" )
		.attr("data-id",element.attr("data-id"))
		.attr("data-username",element.attr("data-username"))
		.html('<a href="#" class="open-hidden-chatbox">'+element.attr("data-username")+'</a> <a class="close-chat-link" href="#"><i class="icon-remove"></i></a>')
		.appendTo($( ".chat-overflow ul" ));
		$(".menu-count").html(parseInt($(".menu-count").html())+1);
		$(".show-hided-chats").show();
		}
	}
	
	chatBoxes.push(chatboxtitle);



	chatboxFocus[chatboxtitle] = false;

	$("#chatbox_"+chatboxtitle+" .chatboxtextarea").blur(function(){
		chatboxFocus[chatboxtitle] = false;
		$("#chatbox_"+chatboxtitle+" .chatboxtextarea").removeClass('chatboxtextareaselected');
	}).focus(function(){
		chatboxFocus[chatboxtitle] = true;
		newMessages[chatboxtitle] = false;
		$('#chatbox_'+chatboxtitle+' .chatboxhead').removeClass('chatboxblink');
		$("#chatbox_"+chatboxtitle+" .chatboxtextarea").addClass('chatboxtextareaselected');
	});
	
	
	//event on adding multiuser chat
	$("#chatbox_"+chatboxtitle +" .add-multiusers-btn").click(function(){
		
		var array=$("#chatbox_"+chatboxtitle).find("select").select2("data");
		$("#chatbox_"+chatboxtitle+" .multi-users-wrapper").removeClass("open");
		if(array.length===0){
			return ;
		}
		var receiversId="";
		var receiversNames="";
		var found=false;
		for (var i = 0; i < array.length; i++) {
			if(chatboxtitle===array[i].id){
				found=true;
			}
			receiversId+=array[i].id+"_";
			receiversNames+=array[i].text+",";
		}
		if(!found){
			receiversId+=chatboxtitle+"_";
			receiversNames+=chatUsername+",";
		}
		
		
		if(receiversId){
			receiversId=receiversId.slice(0,-1);
		}
		if(receiversNames){
			receiversNames=receiversNames.slice(0,-1);
		}
		
		createChatBox(receiversId,receiversNames);
		
		$("#chatbox_"+chatboxtitle).find("select").select2("val","");
	});
	
	
	$("#chatbox_"+chatboxtitle).click(function() {
		if ($('#chatbox_'+chatboxtitle+' .chatboxcontent').css('display') != 'none') {
			$("#chatbox_"+chatboxtitle+" .chatboxtextarea").focus();
		}
	});
	
	//toggle multiuser menu class
	$("#chatbox_"+chatboxtitle +" .multi-users-link").click(function(){
		$("#chatbox_"+chatboxtitle+" .multi-users-wrapper").toggleClass('open');
		return false;
	});
	
	$("#chatbox_"+chatboxtitle+" .chatboxhead").click(function() {
		toggleChatBoxGrowth(chatboxtitle);
		
	});
	
	//prevent document  left and right key propagation
	$("#chatbox_"+chatboxtitle+" .chatboxtextarea").keyup(function(e) {
		switch (e.keyCode) {
		case 37:
			
			e.stopPropagation();
			break;
		case 39:
            e.stopPropagation();
			break;
		}
	});
	

	$(".chatboxcontent").slimscroll({
		height : "190px",
		position : "left",
		opacity : "0.5",
		color : "#555",
		size : "5px"
	});
	
	$("#chatbox_"+chatboxtitle).show();
	
	
	
	
	saveChatState();
    
    
}




function closeChatBox(event,chatboxtitle) {

	var element=getOutMostElement();
	var right=element.css("right");
	
	chatBoxesStorage.getBoxById(chatboxtitle).status="closed";
	
	$("#chatbox_"+chatboxtitle).hide();
	
	restructureChatBoxes();
	
	
	
	
	var length=$(".chat-overflow ul li").length;
	
	if(length!=0){
		
		var liElement=$(".chat-overflow ul li:last");
		var id=liElement.attr("data-id");
		
		
		var width =pixelToNumber(right);
		$("#chatbox_"+id).css("right",width+"px");
		
		$('#chatbox_'+id).show();
		
		$(".menu-count").html(parseInt($(".menu-count").html())-1);
		
		liElement.remove();
		
		
		var newLength=$(".chat-overflow ul li").length;
		if(newLength==0){
			$(".show-hided-chats").hide();
		}
	}
	
	
	saveChatState();
	event.stopPropagation();
}

function toggleChatBoxGrowth(chatboxtitle) {
	
	if ($('#chatbox_'+chatboxtitle+' .chatboxbody').css('display') == 'none') {  
		$('#chatbox_'+chatboxtitle+' .chatboxbody').css('display','block');
		$("#chatbox_"+chatboxtitle+" .chatboxcontent").scrollTop($("#chatbox_"+chatboxtitle+" .chatboxcontent")[0].scrollHeight);
		chatBoxesStorage.getBoxById(chatboxtitle).status="opened";
	} else {
		$('#chatbox_'+chatboxtitle+' .chatboxbody').css('display','none');
		chatBoxesStorage.getBoxById(chatboxtitle).status="minimized";
	}
	
	saveChatState();
	
}


function getOutMostElement(){
	
	
	var element=null ,max=0;

	for (x in chatBoxes) {
		if ($("#chatbox_"+chatBoxes[x]).css('display') != 'none') {
			var right=parseInt($("#chatbox_"+chatBoxes[x]).css('right').replace(/^\D+/g,''));
			if(right>max){
				max=right;
				element=$("#chatbox_"+chatBoxes[x]);
			}
		}
	}
	return element;
}
function pixelToNumber(pixel){
	return parseInt(pixel.replace(/^\D+/g,''));
}

function checkEmptySpace(){
	var availableSize=$(window).width()-210;
	chatBoxCount=parseInt(Math.floor(availableSize/230));
	
	var length = 0;

	for (x in chatBoxes) {
		if ($("#chatbox_"+chatBoxes[x]).css('display') != 'none') {
			length++;
		}
	}
	if(length==chatBoxCount){
		return false;
	}
	else{
		return true;
	}
	
}

function checkChatBoxInputKey(event,chatboxtextarea,chatboxtitle) {
	 
	
	if(event.keyCode == 13 && event.shiftKey == 0)  {
		message = $(chatboxtextarea).val();
		message = message.replace(/^\s+|\s+$/g,"");

		$(chatboxtextarea).val('');
		$(chatboxtextarea).focus();
		$(chatboxtextarea).css('height','44px');
		if (message != '') {
			
			
			var messageObj={
					message : message,
					sender  : username,
					receiver: chatboxtitle,
					type : "",
					recieved : "",
					senderName : "",
					receiverName : ""
			}
			var msg=JSON.stringify(messageObj);
			console.log("send message " +msg);
			websocket.send(msg);
			
				
		
		}
		chatHeartbeatTime = minChatHeartbeat;
		chatHeartbeatCount = 1;

		return false;
	}

	var adjustedHeight = chatboxtextarea.clientHeight;
	var maxHeight = 94;

	if (maxHeight > adjustedHeight) {
		adjustedHeight = Math.max(chatboxtextarea.scrollHeight, adjustedHeight);
		if (maxHeight)
			adjustedHeight = Math.min(maxHeight, adjustedHeight);
		if (adjustedHeight > chatboxtextarea.clientHeight)
			$(chatboxtextarea).css('height',adjustedHeight+8 +'px');
	} else {
		$(chatboxtextarea).css('overflow','auto');
	}
	 
}


function compareTwoUnorderedStrings(a,b){
	var arrayA=a.split("");
	var arrayB=b.split("");
	arrayA.sort();
	arrayB.sort();
	return arrayA.join("")===arrayB.join("");
	

}

