import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Post, Vote } from '../community/community.component';
import { AuthSession } from '@supabase/supabase-js';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {
  @Input() post!: Post;
  @Output() dataChanged = new EventEmitter<void>();
  responding = false;
  message = '';
  user = this.supabase.user;
  userVote: number = 0
  expandedResponses: number[] = [];


  session!: AuthSession;
  constructor(public readonly supabase: SupabaseService) {
    if (this.supabase.session) {
      this.session = this.supabase.session
    }
  }

  async ngOnInit(): Promise<void> {

    // console.log(this.post);
    this.post?.votes?.every((vote) => {
      // console.log(this.user.id)
      // console.warn(vote.user_id)
      if (vote.user_id === this.user.id) {
        this.userVote = vote.direction;
        return false;
      }
      return true;
    });
  }

  toggleResponse(id: number) {
    if (this.expandedResponses.includes(id)) {
      this.expandedResponses.splice(this.expandedResponses.indexOf(id), 1);
    } else {
      this.expandedResponses.push(id);
    }
  }

  async submitResponse() {
    if (this.message != '') {
      const response = new Post();
      response.message = this.message;
      response.parent_id = this.post.id;
      response.user_id = this.user?.id;
      const threadId = this.post.thread_id || this.post.id;
      response.thread_id = threadId
      console.log('upsert', response);
      this.responding = false;
      await this.supabase.createPost(response);
      this.dataChanged.emit();
    }
  }

  async submitVote(direction: number) {
    const existingVote = this.post.votes?.find((v) => v.user_id === this.user.id);
    if (existingVote) {
      if (direction === existingVote.direction) {
        this.post.votes.splice(this.post.votes.indexOf(existingVote), 1);
      } else {
        existingVote.direction = direction;
      }
    } else {
      const vote = new Vote();
      vote.user_id = this.user.id;
      vote.direction = direction;
      this.post.votes?.push(vote);
    }
    await this.supabase.updatePost(this.post);
    this.dataChanged.emit();
  }
}
