import { Component, OnInit, inject } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss']
})
export class ChatsComponent implements OnInit {
  chats: Chat[] = [];
  activeChat: Chat | null = null;
  message!: string;
  username!: string;
  recipient_user_id: string | null = null;
  private route = inject(ActivatedRoute)

  constructor(public readonly supabase: SupabaseService) {
  }

  async ngOnInit(): Promise<void> {
    this.recipient_user_id = this.route.snapshot.paramMap.get('user_id');
    console.log(this.recipient_user_id)
    if (this.recipient_user_id) {
      console.log('getting profile')
      let { data: data, error, status } = await this.supabase.getProfile(this.recipient_user_id)
      console.log(data);
      this.username = data?.username || '';
    }
    this.refreshChats();
  }

  async refreshChats() {
    
    {
      console.log('getting chats')
      let { data: data, error, status } = await this.supabase.getChats()
      // if (error && status !== 406) {

      // }

      if (data && data.length > 0) {
        console.log(data);
        await this.processData(data);
        console.log(this.chats, this.recipient_user_id);
        const foundChat = this.chats.find((chat) => chat.other_user_id === this.recipient_user_id);
        if (foundChat) {
          this.activeChat = foundChat;
        }
      } else {
        console.log('no chats found')
      }
    }
  }

  async processData(messages: any[]) {
    // const chats: Chat[] = [];
    console.log('processing')
    for (const messageObj of messages) {
      console.log(messageObj)
      const otherUserId = this.supabase.user.id === messageObj.sender_user_id ? messageObj.recipient_user_id : messageObj.sender_user_id;
      let existingChat = this.chats.find((chat) => chat.other_user_id === otherUserId);
      console.log(otherUserId, this.chats);
      if (!existingChat) {
        existingChat = existingChat ? existingChat : new Chat();
        existingChat.other_user_id = otherUserId;
        const threadId = messageObj.thread_id || messageObj.id;
        existingChat.threadId = threadId;
        let { data: data, error, status } = await this.supabase.getProfile(otherUserId);
        existingChat.other_username = data?.username || '';
        this.chats.push(existingChat);
        console.log(existingChat);
      }
      const message = new ChatMessage();
      message.id = messageObj.id;
      message.sender_user_id = messageObj.sender_user_id;
      message.recipient_user_id = messageObj.recipient_user_id;
      message.message = messageObj.message;
      message.created_at = messageObj.created_at;
      message.read = messageObj.read;
      message.thread_id = messageObj.thread_id;
      if (!message.read) {
        existingChat.unread++;
      }
      existingChat.messages.push(message);
      console.log(existingChat);
      console.log(this.chats);
    };
  }

  async activateChat(chat: Chat) {
    this.activeChat = chat;
    console.log('activating chat', chat);
    await this.supabase.updateRead(chat);
  }

  async submitResponse() {
    const chatMessage = new ChatMessage(); {
      chatMessage.message = this.message;
      chatMessage.sender_user_id = this.supabase.session?.user?.id || '';
      if (this.activeChat)
        chatMessage.recipient_user_id = this.activeChat.other_user_id;
      if (this.activeChat?.threadId)
        chatMessage.thread_id = this.activeChat?.threadId
    }
    // console.log(chatMessage)
    await this.supabase.createChatMessage(chatMessage)
    await this.refreshChats();
  }

}

export class Chat {
  other_username!: string;
  other_user_id!: string;
  messages: ChatMessage[] = [];
  unread = 0;
  threadId!: number;
}

export class ChatMessage {
  id!: number;
  sender_user_id!: string;
  recipient_user_id!: string;
  message!: string;
  created_at!: Date;
  read!: boolean;
  thread_id!: number;
}
