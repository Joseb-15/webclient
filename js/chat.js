var MegaChat = false;
if (localStorage.megachat) MegaChat=true;

// current active chatid
var chatid = false;


var chat_smileys = {};
chat_smileys['smile'] = [':-)',':)'];
chat_smileys['wink'] = [';-)',';)'];
chat_smileys['tongue'] = [':p',':P',':-P',':-p'];
chat_smileys['grin'] = [':D',':d'];
chat_smileys['confuse'] = [':|',':-|'];
chat_smileys['grasp'] = [':o',':O'];
chat_smileys['sad'] = [':-(',':('];
chat_smileys['cry'] = [';(',':\'(',';-('];
chat_smileys['angry'] = ['(angry)'];

function hideChat()
{
	$('.fm-chat-block').addClass('hidden');
}

function renderChatText(text)
{
	if (!text) text ='';
	for (var i in chat_smileys)
	{
		for (var j in chat_smileys[i]) text = text.replaceAll(chat_smileys[i][j],'<div class="fm-chat-smile ' + i + '"></div>');		
	}	
	text = text.replace(/(?:\r\n|\r|\n)/g, '<br />');	
	return text;	
}


function openChat(id)
{
	chatUI.boot();
	chatUI.events();
	
	if (id) chatid = id;
		
	chatUI.init(chatid);
	
	$('.fm-chat-block').removeClass('hidden');
	
	// remove all chat div's:
	$('.fm-chat-message-pad').addClass('hidden');
	
	// show relevant chat div:
	$('.fm-chat-message-pad.' + chatid).removeClass('hidden');
	
	chatUI.scroll();
	
	chatUI.header();
	
	chatUI.msgArea();
	
	chatUI.init(chatid);
	
	$('#contact2_' + chatid).addClass('selected');
	window.location.hash = '#fm/chat/' + chatid;
}





var chatUI = {};


chatUI.boot = function()
{
	// hide other panels:
	hideEmptyMsg();
	$('.files-grid-view').addClass('hidden');
	$('.fm-blocks-view').addClass('hidden');
	$('.contacts-grid-view').addClass('hidden');
	$('.fm-contacts-blocks-view').addClass('hidden');
	
	// deselect conversation in left panel:
	$('.nw-conversations-item').removeClass('selected');
	
	sectionUIopen('conversations');
};

chatUI.init = function(cid)
{
	if ($('.fm-chat-message-pad.' + cid).length == 0)
	{
		// add chat div to DOM:
		$('<div class="fm-chat-message-pad ' + htmlentities(cid) + ' hidden"></div>').insertBefore('.fm-chat-message-pad.example');
		
		// TODO: prerender history (partly)?
	}
}

chatUI.msgArea = function()
{
	$('.message-textarea').focus();
};

chatUI.msgHeight = function()
{
	var el = '.message-textarea';
	$(el).height('auto');
	var text = $(el).val();   
	var lines = text.split("\n");
	var count = lines.length;		   
	if ($(el).val().length != 0 && count>1) 
	{
		$(el).height($(el).prop("scrollHeight"));
		var scrollBlockHeight = $('.fm-chat-block').outerHeight() - $('.fm-chat-line-block').outerHeight();
		if (scrollBlockHeight != $('.fm-chat-message-scroll').outerHeight()) 
		{
			$('.fm-chat-message-scroll').height(scrollBlockHeight);
			chatUI.scroll();
		}
	}
	else if ($(el).height() > 27)	
	{
		$(el).height('27px');
		chatUI.scroll();
	}
}

chatUI.renderMsg = function(userid,cid,message,typing)
{
	this.init(cid);	
	var class_rightbl ='',avatar = staticpath + 'images/mega/default-small-avatar.png';
	
	// check if the message is from myself
	if (userid == u_handle) class_rightbl = ' right-block';
	// set user avatar (if available):
	if (avatars[userid]) avatar = avatars[userid].url;
	
	if (typing)
	{
		if (!message) 
		{
			// hide typing:
			$('.fm-chat-message-pad.' + cid + ' .fm-chat-messages-block.typing').remove();
		}
		else
		{
			// show typing:
			if ($('.fm-chat-message-pad.' + cid + ' .typing').length == 0) $('.fm-chat-message-pad.' + cid).append('<div class="fm-chat-messages-block typing"><div class="fm-chat-messages-pad"><div class="nw-contact-avatar"><img alt="" src="' + avatar + '"></div><div class="fm-chat-message"><div class="circle" id="circleG"><div id="circleG_1" class="circleG"></div><div id="circleG_2" class="circleG"></div><div id="circleG_3" class="circleG"></div></div></div><div class="clear"></div></div></div>');
		}
	}
	else
	{
		// real message:
		$('.fm-chat-message-pad.' + cid).append('<div class="fm-chat-messages-block' + class_rightbl + '"><div class="fm-chat-messages-pad"><div class="nw-contact-avatar"><img alt="" src="' + avatar + '"></div><div class="fm-chat-message"> <span>' + renderChatText(htmlentities(message)) + '</span> </div><div class="clear"></div></div></div>');		
		$('.fm-chat-message-pad.' + cid).linkify();		
	}
	this.scroll(cid);
}

chatUI.renderDate = function(cid,date)
{
	this.init(cid);
	$('.fm-chat-message-pad.' + cid).append('<div class="nw-chat-date"><div class="nw-chat-date-txt">' + date + '</div></div>');
	this.scroll(cid);
}

chatUI.typing = function(userid,cid)
{
	this.renderMsg(userid,cid,true,true);
}

chatUI.typingStop = function(userid,cid)
{
	this.renderMsg(userid,cid,false,true);
}

chatUI.scroll = function(cid)
{
	// Always put the typing element to the bottom
	if (cid) $('.fm-chat-message-pad.' + cid + ' .typing').appendTo('.fm-chat-message-pad.' + cid);
	
	// If chat is currently not visible, no need to initialize the scroll
	if (cid && chatid !== cid) return false;
	
	// TODO: remember scroll state for each chat and scroll down automatically
	$('.fm-chat-message-scroll').jScrollPane({enableKeyboardNavigation:false,showArrows:true, arrowSize:5});
	
	var jsp = $('.fm-chat-message-scroll').data('jsp');
	jsp.scrollToBottom();	
}


chatUI.header = function()
{
	if (!chatid) $('.fm-right-header.chat').addClass('hidden');
	
	$('.fm-right-header.chat').removeClass('hidden');
	
	$('.fm-right-header .nw-contact-avatar').removeClass('verified');
	
	// TODO: implement verification logic
	if (M.u[chatid].verified) $('.fm-right-header .nw-contact-avatar').addClass('verified');
	
	var avatar = staticpath + 'images/mega/default-small-avatar.png';
	if (avatars[chatid]) avatar = avatars[chatid].url;
	$('.fm-right-header.chat .nw-contact-avatar img').attr('src',avatar);
	
	// set name:
	$('.fm-chat-user').text(M.u[chatid].m);
	$('.fm-chat-user-info').removeClass('online offline away busy');
	
	// online status:
	$('.fm-chat-user-info').addClass('offline');	
	$('.fm-chat-user-status').text('offline');

	// hide add user button (group chat will come later)
	$('.chat-button.fm-add-user').addClass('hidden');
}




chatUI.events = function()
{
	// add onclick events for contact list:
	$('.nw-conversations-item').unbind('click');
	$('.nw-conversations-item').bind('click',function(e)
	{
		var id = $(this).attr('id');
		if (id) chatid = id.replace('contact2_','');
		openChat();		
	});
	
	// general chat UI logic (needs further refining):
	
	$('.fm-chat-input-block .message-textarea').unbind('focus');
	$('.fm-chat-input-block .message-textarea').bind('focus',function()
	{
		if ($(this).val() == 'Write a message...') $(this).val('');
	});
	
	$('.fm-chat-input-block .message-textarea').unbind('blur');
	$('.fm-chat-input-block .message-textarea').bind('blur',function()
	{
		if ($(this).val() == '') $(this).val('Write a message...');
	});
	
	$('.fm-chat-input-block .message-textarea').unbind('keyup');
	$('.fm-chat-input-block .message-textarea').bind('keyup',function(e) 
	{
		if (e.keyCode == 13 && e.shiftKey == false)
		{
			chatUI.renderMsg(u_handle,chatid,$(this).val());			
			$(this).val('');
		}
		else
		{
		
		}
		chatUI.msgHeight();
	});
	
	$('.fm-chat-attach-file').unbind('click');
	$('.fm-chat-attach-file').bind('click', function() {
		if ($(this).attr('class').indexOf('active') > -1) 
		{
			 $('.fm-chat-attach-popup').addClass('hidden');
			 $(this).removeClass('active');
		} 
		else 
		{
			 $('.fm-chat-attach-popup').removeClass('hidden');
			 $(this).addClass('active');
			 var positionY = $('.fm-chat-line-block').outerHeight() - $('.fm-chat-attach-arrow').position().top;
			 $('.fm-chat-attach-popup').css('bottom', positionY - 17 + 'px');
		}
	});
	
	$('.nw-chat-button.red').unbind('click');
	$('.nw-chat-button.red').bind('click', function() {
		var chatDownloadPopup = $('.fm-chat-download-popup');
		if ($(this).attr('class').indexOf('active') == -1) 
		{
			 $('.nw-chat-button.red.active').removeClass('active');
			 var p = $(this);
			 var positionY = $(this).closest('.fm-chat-message-pad').outerHeight() - $(this).position().top;
			 var positionX = $(this).position().left;
	        // if (positionY - 174 > 0) {
			   $(chatDownloadPopup).css('bottom', positionY - 7  + 'px');
			// } else {
			//   $(chatDownloadPopup).css('bottom', positionY + 'px');
			//   $(chatDownloadPopup).addClass('top');
			// }
			 chatDownloadPopup.addClass('active');
			 chatDownloadPopup.css('margin-left', '-'+ chatDownloadPopup.outerWidth()/2 + 'px');
			 chatDownloadPopup.css('left', positionX + $(this).outerWidth()/2 + 10  + 'px');
		     $(this).addClass('active');
		} 
		else 
		{
			 $(this).removeClass('active');
			 chatDownloadPopup.removeClass('active');
			 chatDownloadPopup.css('left', '-' + 10000 + 'px');
		}
			 
	});
	
	$('.fm-chat-download-button').unbind('click');
	$('.fm-chat-download-button').bind('click', function() 
	{
		var chatDownloadPopup = $('.fm-chat-download-popup.active');
		chatDownloadPopup.removeClass('active');
		chatDownloadPopup.css('left', '-' + 10000 + 'px');
		$('.nw-chat-button.red.active').removeClass('active');
	});
	
    function closeChatPopups() 
	{
		var activePopup = $('.chat-popup.active');
		var activeButton = $('.chat-button.active');
		activeButton.removeClass('active');
		activePopup.removeClass('active');
		if (activePopup.attr('class')) 
		{
		  activeButton.removeClass('active');
		  activePopup.removeClass('active');
		  if (activePopup.attr('class').indexOf('fm-add-contact-popup') == -1) activePopup.css('left', '-' + 10000 + 'px'); 
		  else activePopup.css('right', '-' + 10000 + 'px'); 
		}
	}
	
	
	// currently not in use (for group chat):
	$('.fm-add-user').unbind('click');
	$('.fm-add-user').bind('click', function() 
	{
	    var positionX = $(this).position().left;
		var addUserPopup = $('.fm-add-contact-popup');
		if ($(this).attr('class').indexOf('active') == -1) 
		{
			 closeChatPopups();
			 addUserPopup.addClass('active');
			 $(this).addClass('active');
			 $('.fm-add-contact-arrow').css('right', $(this).outerWidth()/2  + 'px'); 
			 addUserPopup.css('right', 0 + 'px'); 
		} 
		else 
		{
			 addUserPopup.removeClass('active');
			 addUserPopup.css('right', '-' + '10000' + 'px'); 
			 $(this).removeClass('active');
			 
		}
	});
	
	$('.fm-send-files').unbind('click');
	$('.fm-send-files').bind('click', function() 
	{
	    var positionX = $(this).position().left;
		var sendFilesPopup = $('.fm-send-files-popup');
		if ($(this).attr('class').indexOf('active') == -1) 
		{
			 closeChatPopups();
			 sendFilesPopup.addClass('active');
			 $(this).addClass('active');
			 $('.fm-send-files-arrow').css('left', $(this).outerWidth()/2  + 'px'); 
			 sendFilesPopup.css('left',  $(this).position().left + 'px'); 
		} 
		else 
		{
			 sendFilesPopup.removeClass('active');
			 sendFilesPopup.css('left', '-' + '10000' + 'px'); 
			 $(this).removeClass('active');
			 
		}
	});
	
	$('.fm-start-call').unbind('click');
	$('.fm-start-call').bind('click', function() 
	{
	    var positionX = $(this).position().left;
		var sendFilesPopup = $('.fm-start-call-popup');
		if ($(this).attr('class').indexOf('active') == -1) 
		{
			 closeChatPopups();
			 sendFilesPopup.addClass('active');
			 $(this).addClass('active');
			 $('.fm-start-call-arrow').css('left', $(this).outerWidth()/2  + 'px'); 
			 sendFilesPopup.css('left',  $(this).position().left + 'px'); 
		} 
		else 
		{
			 sendFilesPopup.removeClass('active');
			 sendFilesPopup.css('left', '-' + '10000' + 'px'); 
			 $(this).removeClass('active');			
		}
	});
	
	$('.fm-chat-emotions-icon').unbind('click');
	$('.fm-chat-emotions-icon').bind('click', function() 
	{
		if ($(this).attr('class').indexOf('active') == -1) 
		{
			$(this).addClass('active');
			$('.fm-chat-emotion-popup').addClass('active');
		} 
		else 
		{
			$(this).removeClass('active');
			$('.fm-chat-emotion-popup').removeClass('active');
		}
	});
	
	$('.fm-chat-smile').unbind('click');
	$('.fm-chat-smile').bind('click', function() 
	{
			$('.fm-chat-emotions-icon').removeClass('active');
			$('.fm-chat-emotion-popup').removeClass('active');			
			var c = $(this).attr('class');
			if (c)
			{
				c = c.replace('fm-chat-smile ','');				
				if ($('.message-textarea').val() == 'Write a message...') $('.message-textarea').val('');				
				$('.message-textarea').val($('.message-textarea').val() + chat_smileys[c][0]);
				setTimeout(function()
				{
					moveCursortoToEnd($('.message-textarea')[0]);
				},1);
			}
	});
	
	$('.multiple-sharing .nw-chat-expand-arrow').unbind('click');
	$('.multiple-sharing .nw-chat-expand-arrow').bind('click', function() 
	{
		var sharingBlock = $(this).closest('.fm-chat-messages-block');
		if ($(sharingBlock).attr('class').indexOf('expanded') > -1) sharingBlock.removeClass('expanded');
		else sharingBlock.addClass('expanded');
		var chatDownloadPopup = $('.fm-chat-download-popup.active');
		chatDownloadPopup.removeClass('active');
		chatDownloadPopup.css('left', '-' + 10000 + 'px');
		$('.nw-chat-button.red.active').removeClass('active');
		chatUI.scroll();
	});
	
	$('.fm-chat-popup-button.from-cloud').unbind('click');
	$('.fm-chat-popup-button.from-cloud').bind('click', function() 
	{
		$('.fm-dialog-overlay').removeClass('hidden');
		$('.fm-chat-attach-popup').removeClass('hidden');
	});
	
	$('.fm-chat-popup-button.add-contact').unbind('click');
	$('.fm-chat-popup-button.add-contact').bind('click', function() 
	{
		$('.fm-dialog-overlay').removeClass('hidden');
		$('.fm-add-user-popup').removeClass('hidden');
	});
	
	//$('.fm-chat-line-block')
	
	$('.nw-fm-close-button').unbind('click');
	$('.nw-fm-close-button').bind('click', function() 
	{
		$('.fm-dialog-overlay').addClass('hidden');
		$(this).closest('.fm-dialog-popup').addClass('hidden');
	});	
}