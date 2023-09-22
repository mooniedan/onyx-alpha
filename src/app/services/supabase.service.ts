import { Injectable } from '@angular/core'
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js'
import { environment } from 'src/environments/environment'
import { Post } from '../community/community.component';
import { Profile } from '../profile/profile.component';
import { Chat, ChatMessage } from '../chats/chats.component';
import { FeatureRequest } from '../feature-requests/feature-requests.component';

export interface FinanceData {
  id: number;
  userId: string
  data: any
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient
  _session: AuthSession | null = null
  profile: Profile = new Profile();
  user!: User;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
    this.authChanges((_, session) => {
      if (session) {
        console.warn('refreshing session')
        this._session = session;
        const { user } = this._session
        this.user = user;
        this.refreshProfile();
      }
    })
  }

  get session() {
    this.supabase.auth.getSession().then(({ data }) => {
      this._session = data.session
    })
    return this._session
  }

  async refreshProfile() {
    return new Promise(async (resolve, reject) => {
      console.log(this.user);
      if (this.user) {
        this.profile.user_id = this.user.id;
        try {
          const { data, error } = await this.getProfile(this.user.id)
          if (error) {
            console.error(error);
            reject(error);
          }
          if (data) {
            console.warn(data);
            this.profile = data;
            resolve(data);
          }
        } catch (error) {
          console.error(error);
          reject(error);
        }
      }
      else {
        console.error('error getting profile');
        reject();
      }
    });
  }

  getFinanceData(userId: string) {
    // const dbData: any = 
    return this.supabase
      .from('financedata')
      .select(`id, user_id, data`)
      .eq('user_id', userId)
      .single()
  }

  updateFinanceData(data: any) {
    return this.supabase.from('financedata').upsert(data)
  }

  getPosts(): any {

    return this.supabase
      .from('posts')
      .select(
        `id, 
        profiles(username),
        user_id, 
        thread_id, 
        parent_id, 
        posted_at, 
        subject, 
        message, 
        tags, 
        votes`)
  }

  createPost(post: Post): any {
    return this.supabase.from('posts').upsert(post.toJson())
  }

  updatePost(post: Post): any {
    return this.supabase.from('posts').
      update({ votes: post.votes})
      .eq('id', post.id)
  }

  getProfile(userId: string) {
    return this.supabase
      .from('profiles')
      .select(`id, user_id, created_at, location, year_of_birth, dependents, marital_status, username, interests`)
      .eq('user_id', userId)
      .single()
  }

  createProfile(profile: Profile) {
    console.log('upsert', profile);
    return this.supabase.from('profiles').upsert(profile)
  }

  updateProfile(profile: Profile) {
    return this.supabase.from('profiles').
      update(profile)
      .eq('user_id', profile.user_id)
  }

  getFeatureRequests() {
    return this.supabase
      .from('features')
      .select(
        `id, 
        suggested_at
        user_id, 
        feature, 
        votes`)
  }

  createFeatureRequest(featureRequest: FeatureRequest) { 
    console.log('upsert', featureRequest);
  return this.supabase.from('features').upsert(featureRequest)
  }

  updateFeatureVotes(featureRequest: FeatureRequest) {
    return this.supabase.from('features').
    update({ votes: featureRequest.votes})
    .eq('id', featureRequest.id)
  }

  getChats() {
    return this.supabase
      .from('messages')
      .select(`id, 
      created_at, 
      thread_id, 
      message, 
      read, 
      sender_user_id,
      recipient_user_id
    `)
      // .or(`sender_user_id.eq('${this.user.id}'), recipient_user_id.eq('${this.user.id}')`)
      // .or('sender_user_id.eq(abc), recipient_user_id.eq(abc)');
      .or(`sender_user_id.eq.${this.user.id},recipient_user_id.eq.${this.user.id}`);
    // aea346eb-b854-456d-b74a-264cd5de7755
  }

  updateRead(chat: Chat) {
    return this.supabase.from('messages').
      update({ read: true })
      .eq('thread_id', chat.threadId)
      .eq('recipient_user_id', this.user.id)
  }


  // createChatMessage(message: string, chat?: Chat) {
  //   const sender_id = this.user.id;
  //   const recepient_id = this.user.id === chat?.userIds[0] ? chat?.userIds[1] : chat?.userIds[0];
  //   const messageItem: any = {
  //     message: message,
  //     sender_user_id: sender_id,
  //     recepient_user_id: recepient_id,
  //   }
  //   if (chat?.threadId) {
  //     messageItem.thread_id = chat.threadId;
  //   }
  //   return this.supabase.from('messages').upsert(messageItem)
  createChatMessage(chatMessage: ChatMessage) {
    return this.supabase.from('messages').upsert(chatMessage)

  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }

  async signUp(email: string, password: string) {
    return await this.supabase.auth.signUp({
      email: email,
      password: password
    })
  }

  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({
      email: email,
      password: password
    })
  }

  async signOut() {
    return this.supabase.auth.signOut()
  }

  async requestPassword(email: string) {
    return await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://getonyx.co',
    })
  }
}
/*
create table
  posts (
    id bigint generated by default as identity primary key,
    user_id uuid references auth.users not null,
    thread_id bigint,
    parent_id bigint,
    posted_at timestamp with time zone default timezone ('utc'::text, now()) not null,
    subject text,
    message text,
    tags - text,
    votes jsonb,
  );
 
  alter table posts
  enable row level security;
 
  create policy "Public profiles are viewable by everyone." on posts
  for select using (true);
*/
const mockPosts = [
  {
    "id": "1",
    "user_id": "aea346eb-b854-456d-b74a-264cd5de7755",
    "thread_id": null,
    "parent_id": null,
    "posted_at": "2023-09-18T21:21:39.257Z",
    "subject": "1st Long Message...",
    "message": "blah de blah ",
    "tags": "debt, credit",
    "votes": {
      "4d66dd8a-d4e5-43b6-8479-2ba60b75fbe0": 1,
      "20f8dd28-a9ae-48e6-9aa1-62788e6f0af1": 1
    }
  },
  {
    "id": "2",
    "user_id": "4d66dd8a-d4e5-43b6-8479-2ba60b75fbe0",
    "thread_id": "1",
    "parent_id": "1",
    "posted_at": "2023-09-18T21:22:39.257Z",
    "subject": null,
    "message": "1st response to msg 1",
    "tags": "debt",
    "votes": { "20f8dd28-a9ae-48e6-9aa1-62788e6f0af1": 1 }
  },
  {
    "id": "3",
    "user_id": "20f8dd28-a9ae-48e6-9aa1-62788e6f0af1",
    "thread_id": "1",
    "parent_id": "1",
    "posted_at": "2023-09-18T21:23:39.257Z",
    "subject": null,
    "message": "2nd response to msg 1",
    "tags": "debt",
    "votes": { "aea346eb-b854-456d-b74a-264cd5de7755": 1 }
  },
  {
    "id": "4",
    "user_id": "aea346eb-b854-456d-b74a-264cd5de7755",
    "thread_id": null,
    "parent_id": null,
    "posted_at": "2023-09-18T21:24:39.257Z",
    "subject": "2nd Long Message...",
    "message": "blah de blah ",
    "tags": "house",
    "votes": { "4d66dd8a-d4e5-43b6-8479-2ba60b75fbe0": 1 }
  },
  {
    "id": "5",
    "user_id": "4d66dd8a-d4e5-43b6-8479-2ba60b75fbe0",
    "thread_id": "4",
    "parent_id": "4",
    "posted_at": "2023-09-18T21:25:39.257Z",
    "subject": null,
    "message": "1st response to msg 4",
    "tags": "house",
    "votes": {}
  },
  {
    "id": "6",
    "user_id": "20f8dd28-a9ae-48e6-9aa1-62788e6f0af1",
    "thread_id": "4",
    "parent_id": "4",
    "posted_at": "2023-09-18T21:26:39.257Z",
    "subject": null,
    "message": "2nd response to msg 4",
    "tags": "house",
    "votes": {}
  },
  {
    "id": "7",
    "user_id": "aea346eb-b854-456d-b74a-264cd5de7755",
    "thread_id": "4",
    "parent_id": "5",
    "posted_at": "2023-09-18T21:27:39.257Z",
    "subject": null,
    "message": "First response to response 5",
    "tags": "house",
    "votes": {}
  }
]