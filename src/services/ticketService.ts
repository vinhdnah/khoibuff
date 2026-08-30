import { Ticket, TicketMessage, TicketStatus } from '../types';
import { LocalStore } from '../lib/localStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const ticketService = {
  async createTicket(data: {
    userId: string;
    subject: string;
    category: any;
    priority?: any;
    message: string;
    orderId?: string;
  }): Promise<Ticket> {
    const priority = data.priority || 'normal';
    if (isSupabaseConfigured) {
      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert({
          user_id: data.userId,
          subject: data.subject,
          category: data.category,
          priority,
          order_id: data.orderId || null,
          status: 'open',
        })
        .select()
        .single();
      if (error) throw error;

      // Insert first message
      await supabase.from('ticket_messages').insert({
        ticket_id: ticket.id,
        sender_id: data.userId,
        sender_role: 'user',
        message: data.message,
      });

      return ticket;
    }

    const newTicket: Ticket = {
      id: `tkt_${Date.now()}`,
      user_id: data.userId,
      subject: data.subject,
      category: data.category,
      priority,
      status: 'open',
      order_id: data.orderId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const tickets = LocalStore.getTickets();
    tickets.unshift(newTicket);
    LocalStore.saveTickets(tickets);

    const firstMsg: TicketMessage = {
      id: `msg_${Date.now()}`,
      ticket_id: newTicket.id,
      sender_id: data.userId,
      sender_role: 'user',
      message: data.message,
      created_at: new Date().toISOString(),
    };
    const messages = LocalStore.getTicketMessages();
    messages.push(firstMsg);
    LocalStore.saveTicketMessages(messages);

    return newTicket;
  },

  async getUserTickets(userId: string): Promise<Ticket[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }

    return LocalStore.getTickets().filter((t) => t.user_id === userId);
  },

  async getAllTickets(): Promise<Ticket[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('tickets')
        .select('*, profiles:user_id (email, username, full_name)')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }

    return LocalStore.getTickets();
  },

  async getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*, profiles:sender_id (full_name, avatar_url, role)')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    }

    return LocalStore.getTicketMessages().filter((m) => m.ticket_id === ticketId);
  },

  async replyTicket(data: {
    ticketId: string;
    senderId: string;
    senderRole: 'user' | 'admin';
    message: string;
    newStatus?: TicketStatus;
  }): Promise<TicketMessage> {
    if (isSupabaseConfigured) {
      const { data: msg, error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: data.ticketId,
          sender_id: data.senderId,
          sender_role: data.senderRole,
          message: data.message,
        })
        .select()
        .single();
      if (error) throw error;

      if (data.newStatus) {
        await supabase.from('tickets').update({ status: data.newStatus, updated_at: new Date().toISOString() }).eq('id', data.ticketId);
      }

      return msg;
    }

    const newMsg: TicketMessage = {
      id: `msg_${Date.now()}`,
      ticket_id: data.ticketId,
      sender_id: data.senderId,
      sender_role: data.senderRole,
      message: data.message,
      created_at: new Date().toISOString(),
    };

    const messages = LocalStore.getTicketMessages();
    messages.push(newMsg);
    LocalStore.saveTicketMessages(messages);

    const tickets = LocalStore.getTickets();
    const tIdx = tickets.findIndex((t) => t.id === data.ticketId);
    if (tIdx !== -1) {
      tickets[tIdx].status = data.newStatus || (data.senderRole === 'admin' ? 'answered' : 'pending');
      tickets[tIdx].updated_at = new Date().toISOString();
      LocalStore.saveTickets(tickets);
    }

    return newMsg;
  },

  async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('tickets').update({ status }).eq('id', ticketId);
      return;
    }

    const tickets = LocalStore.getTickets();
    const tIdx = tickets.findIndex((t) => t.id === ticketId);
    if (tIdx !== -1) {
      tickets[tIdx].status = status;
      tickets[tIdx].updated_at = new Date().toISOString();
      LocalStore.saveTickets(tickets);
    }
  },
};
