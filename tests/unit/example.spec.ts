import type { RbtDomophone, RbtFlat, RbtHouse, RbtSubscriber } from '@/types/operations';
import {
  buildSubscriberFlatsPatch,
  domophonePayload,
  flatEntranceModels,
  normalizeRfid,
  statusColor,
  subscriberRole,
} from '@/utils/operations';
import { describe, expect, test } from 'vitest';

describe('RBT operations helpers', () => {
  test('normalizes a short RFID only before sending it', () => {
    expect(normalizeRfid('a1:b2:c3')).toBe('00000000A1B2C3');
  });

  test('does not accept malformed RFID as a valid 7-byte key', () => {
    expect(normalizeRfid('not-a-key')).toBe('NOTAKEY');
  });

  test('maps device statuses to Ionic colors', () => {
    expect(statusColor({ status: 'OK' })).toBe('success');
    expect(statusColor({ status: 'SIP error' })).toBe('warning');
    expect(statusColor({ status: 'offline' })).toBe('danger');
  });

  test('preserves subscriber relations and applies the selected role', () => {
    const subscriber = {
      subscriberId: 7,
      flats: [{ flatId: 10, role: 0 }, { flatId: 11, role: 1 }],
    } as RbtSubscriber;
    expect(subscriberRole(subscriber, 10)).toBe('owner');
    expect(buildSubscriberFlatsPatch(subscriber, 11, 'owner')).toEqual({
      '10': { role: 1 },
      '11': { role: 1 },
    });
  });

  test('builds the full payload required by the domophone PUT API', () => {
    const result = domophonePayload({ domophoneId: 5, name: 'Panel', locksAreOpen: 0 } as RbtDomophone, {
      locksAreOpen: 1,
    });
    expect(result.name).toBe('Panel');
    expect(result.locksAreOpen).toBe(1);
    expect(result.ext).toEqual({});
  });

  test('joins flat entrances with house and domophone data', () => {
    const flat = {
      flatId: 1,
      entrances: [{ entranceId: 2, domophoneId: 3 }],
    } as RbtFlat;
    const house = {
      flats: [],
      cameras: [],
      entrances: [{ entranceId: 2, entrance: 'Entrance 1', domophoneOutput: 4 }],
    } as RbtHouse;
    const result = flatEntranceModels(flat, house, [{ domophoneId: 3, name: 'Panel' } as RbtDomophone]);
    expect(result[0]).toMatchObject({ entranceName: 'Entrance 1', doorId: 4, domophoneId: 3 });
  });
});
