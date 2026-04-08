// Lexicon assembly. Each surface lives in its own file under surfaces/
// and exports a Record<string, Templated>. This file barrel-imports them
// and assembles the typed Lexicon read by getCopy().
//
// Sub-task 7 backfills the chassis-touching keys; per-surface backfill
// happens when each surface gets built in steps 2–11.

import type { Lexicon } from './types';

import { common } from './surfaces/common';
import { landing } from './surfaces/landing';
import { dashboard } from './surfaces/dashboard';
import { createTrip } from './surfaces/create-trip';
import { tripPageShared } from './surfaces/trip-page-shared';
import { tripPageSketch } from './surfaces/trip-page-sketch';
import { tripPageSell } from './surfaces/trip-page-sell';
import { tripPageLock } from './surfaces/trip-page-lock';
import { tripPageGo } from './surfaces/trip-page-go';
import { lockFlow } from './surfaces/lock-flow';
import { rsvp } from './surfaces/rsvp';
import { emptyStates } from './surfaces/empty-states';
import { errors } from './surfaces/errors';
import { toasts } from './surfaces/toasts';
import { emails } from './surfaces/emails';
import { passport } from './surfaces/passport';
import { builderState } from './surfaces/builder-state';
import { inviteeState } from './surfaces/invitee-state';
import { nudges } from './surfaces/nudges';
import { cutoff } from './surfaces/cutoff';
import { lodgingVoting } from './surfaces/lodging-voting';
import { extras } from './surfaces/extras';
import { themePicker } from './surfaces/theme-picker';
import { auth } from './surfaces/auth';
import { crew } from './surfaces/crew';
import { buzz } from './surfaces/buzz';

export const lexicon: Lexicon = {
  common,
  landing,
  dashboard,
  createTrip,
  tripPageShared,
  tripPageSketch,
  tripPageSell,
  tripPageLock,
  tripPageGo,
  lockFlow,
  rsvp,
  emptyStates,
  errors,
  toasts,
  emails,
  passport,
  builderState,
  inviteeState,
  nudges,
  cutoff,
  lodgingVoting,
  extras,
  themePicker,
  auth,
  crew,
  buzz,
};

export type { Lexicon, SurfaceKey } from './types';
