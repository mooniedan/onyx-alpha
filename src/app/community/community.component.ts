import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { AuthSession } from '@supabase/supabase-js';

@Component({
  selector: 'app-community',
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.scss']
})
export class CommunityComponent implements OnInit {
  rawPosts: any[] = [];
  posts: Post[] = [];
  creating = false;
  subject = '';
  message = '';
  loading = false;
  user: any;

  session!: AuthSession;
  constructor(private readonly supabase: SupabaseService) {
    if (this.supabase.session) {
      this.session = this.supabase.session
    }
  }

  async ngOnInit(): Promise<void> {
    this.supabase.authChanges((_, session) => {
      if (session)
        this.session = session
    })
    await this.getPosts()
  }

  async getPosts() {
    try {
      this.loading = true

      const { user } = this.session
      // console.log(user);
      this.user = user;
      let { data: data, error, status } = await this.supabase.getPosts()

      // console.log(data, error, status);

      if (error && status !== 406) {
        throw error
      }

      // console.log(data);
      if (data) {
        this.rawPosts = data;
        this.posts = [];
        data.forEach((postRow: any) => {
          const post = new Post();
          post.id = postRow.id;
          post.user_id = postRow.user_id;
          post.thread_id = postRow.thread_id;
          post.parent_id = postRow.parent_id;
          post.posted_at = postRow.posted_at;
          post.subject = postRow.subject;
          post.message = postRow.message;
          post.tags = postRow.tags?.split(',');
          // console.log(postRow.id, postRow.votes)
          Object.keys(postRow.votes).forEach((key: string) => {

            // console.warn(key, postRow.votes[key])
            const vote = new Vote();
            vote.user_id = key;
            vote.direction = postRow.votes[key];
            post.votes.push(vote);
          });
          // console.log(post.id, post.votes);
          if (!post.parent_id) {
            this.posts.push(post);
          } else {
            const parentPost = this.findParent(this.posts, post);
            // console.log(post.id, parentPost?.id);
            parentPost?.responses.push(post);
          }
        });
        // console.log(data);
        console.log(this.posts);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
      }
    } finally {
      // this.loading = false
    }
  }

  async createPost() {
    if (this.message != '') {
      const post = new Post();
      post.subject = this.subject;
      post.message = this.message;
      post.user_id = this.user?.id;
      console.log('upsert', post);
      this.creating = false;
      await this.supabase.createPost(post);
      this.refreshData()
    }
  }

  findParent(posts: Post[], post: Post): Post | null {
    // console.log(`looking for  ${post.id}`);
    let foundPost: Post | null = null;
    posts.every(searchPost => {
      // if (searchPost.thread_id != post.thread_id) return;
      // console.log(`checking ${post.parent_id} against ${searchPost.id} `)
      const threadId = searchPost.thread_id || searchPost.id;
      if (post.thread_id !== threadId) {
        // console.warn(`${post.id} in thread ${post.thread_id} not in thread ${threadId} `);
        return true;
      }

      if (searchPost.id === post.parent_id) {
        // console.log(`found ${post.parent_id} in ${searchPost.id} `)
        foundPost = searchPost;
        return false;
      }
      // console.log(`searching deper in ${searchPost.id} for  ${post.parent_id}`)
      // console.log (searchPost.responses);

      const foundInChild = this.findParent(searchPost.responses, post);
      if (foundInChild) {
        foundPost = foundInChild;
        return false;
      }
      // console.log(`not found in ${searchPost.id}`)
      return true
    });
    return foundPost;
  }

  async refreshData() {
    console.warn('refreshing data')
    const rawPosts: any[] = [];
    const allPosts = this.getPostArray(this.posts, rawPosts);
    console.log(rawPosts);
    console.log(this.rawPosts);

    this.rawPosts = [];
    this.posts = [];
    await this.getPosts();
  }

  getPostArray(postArray: Post[], rawPosts: any[]) {
    postArray.forEach(post => {
      rawPosts.push(post.toJson());
      if (post.responses.length > 0) {
        this.getPostArray(post.responses, rawPosts);
      }
    });
  }
}

export class Post {
  id!: number;
  user_id	!: string;
  thread_id	!: number;
  parent_id	!: number;
  posted_at	!: Date;
  subject	!: string;
  message	!: string;
  tags	!: string[];
  votes: Vote[] = [];
  responses: Post[] = [];
  get score(): number {
    let score = 0;
    this.votes.forEach(vote => {
      score += vote.direction;
    });
    return score;
  }

  toJson() {
    const votes: { [user_id: string]: number } = {};
    this.votes.forEach(vote => {
      votes[vote.user_id] = vote.direction;
    });
    return {
      id: this.id, // do not send for new post
      user_id: this.user_id,
      thread_id: this.thread_id,
      parent_id: this.parent_id,
      posted_at: this.posted_at, // do not send for new post
      subject: this.subject,
      message: this.message,
      tags: this.tags?.join(','),
      votes: votes
    }
  }

  // {
  //   "id": "1",
  //   "user_id": "aea346eb-b854-456d-b74a-264cd5de7755",
  //   "thread_id": null,
  //   "parent_id": null,
  //   "posted_at": "2023-09-18T21:21:39.257Z",
  //   "subject": "1st Long Message...",
  //   "message": "blah de blah ",
  //   "tags": "debt, credit",
  //   "votes": {
  //     "4d66dd8a-d4e5-43b6-8479-2ba60b75fbe0": 1,
  //     "20f8dd28-a9ae-48e6-9aa1-62788e6f0af1": 1
  //   }
  // },
  // {
  //   "id": "2",
  //   "user_id": "4d66dd8a-d4e5-43b6-8479-2ba60b75fbe0",
  //   "thread_id": "1",
  //   "parent_id": "1",
  //   "posted_at": "2023-09-18T21:22:39.257Z",
  //   "subject": null,
  //   "message": "1st response to msg 1",
  //   "tags": "debt",
  //   "votes": { "20f8dd28-a9ae-48e6-9aa1-62788e6f0af1": 1 }
  // },
}

export class Vote {
  user_id!: string;
  direction!: number;
}
