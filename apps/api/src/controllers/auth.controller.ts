import { Request, Response, NextFunction } from 'express';
import { supabase, supabaseAuth } from '../config/supabase';
import { BadRequestError } from '../utils/errors';
import type { AuthenticatedRequest } from '../middleware/auth';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      throw new BadRequestError('Email, password y username son requeridos');
    }

    // Check username uniqueness
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (existing) throw new BadRequestError('El username ya esta en uso');

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { username },
      email_confirm: true,
    });

    if (error) throw new BadRequestError(error.message);

    // Sign in to get tokens — use separate client to avoid contaminating service_role
    const { data: session, error: loginError } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) throw new BadRequestError(loginError.message);

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.status(201).json({
      data: {
        user: profile,
        access_token: session.session!.access_token,
        refresh_token: session.session!.refresh_token,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { display_name, avatar_url } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({ display_name, avatar_url })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
}
