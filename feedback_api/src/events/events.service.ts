import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';

export interface ReviewEvent {
  eventId: string;
  type: 'review.created' | 'review.updated' | 'review.deleted';
  timestamp: string;
  payload: {
    userId: string;
    score: number;
    oldUserId?: string; // Para quando muda o userId na atualização
    oldScore?: number; // Para quando muda o score na atualização
  };
}

@Injectable()
export class EventsService {
  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  async publishReviewCreated(userId: string, score: number) {
    const event: ReviewEvent = {
      eventId: uuidv4(),
      type: 'review.created',
      timestamp: new Date().toISOString(),
      payload: {
        userId,
        score,
      },
    };

    await this.client.emit('review.created', event).toPromise();
  }

  async publishReviewUpdated(
    userId: string,
    score: number,
    oldUserId?: string,
    oldScore?: number,
  ) {
    const event: ReviewEvent = {
      eventId: uuidv4(),
      type: 'review.updated',
      timestamp: new Date().toISOString(),
      payload: {
        userId,
        score,
        oldUserId,
        oldScore,
      },
    };

    await this.client.emit('review.updated', event).toPromise();
  }

  async publishReviewDeleted(userId: string, score: number) {
    const event: ReviewEvent = {
      eventId: uuidv4(),
      type: 'review.deleted',
      timestamp: new Date().toISOString(),
      payload: {
        userId,
        score,
      },
    };

    await this.client.emit('review.deleted', event).toPromise();
  }
}

