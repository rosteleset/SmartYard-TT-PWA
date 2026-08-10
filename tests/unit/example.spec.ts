import type { RbtCamera, RbtDomophone, RbtFlat, RbtHouse, RbtSubscriber } from '@/types/operations';
import {
  availableIssueProjects,
  availableIssueWorkflows,
  issueTemplateModels,
} from '@/utils/issues';
import {
  buildSubscriberFlatsPatch,
  cameraPlayerUrl,
  cameraPreviewUrl,
  cameraStreamName,
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

  test('builds a SesameDVR embed URL without dropping the playback token', () => {
    const camera = {
      cameraId: 7,
      dvrStream: 'https://dvr.example.test/cam-10-0-0-7?token=secret',
    } as RbtCamera;
    const player = new URL(cameraPlayerUrl(camera));

    expect(player.pathname).toBe('/cam-10-0-0-7/embed.html');
    expect(player.searchParams.get('token')).toBe('secret');
    expect(player.searchParams.get('dvr')).toBe('true');
  });

  test('builds a SesameDVR preview URL without dropping the playback token', () => {
    const camera = {
      cameraId: 7,
      dvrStream: 'https://dvr.example.test/cam-10-0-0-7?token=secret',
    } as RbtCamera;
    const preview = new URL(cameraPreviewUrl(camera));

    expect(preview.pathname).toBe('/cam-10-0-0-7/preview.jpg');
    expect(preview.searchParams.get('token')).toBe('secret');
  });

  test('prefers the configured technical stream name', () => {
    const camera = {
      cameraId: 7,
      dvrStream: 'https://dvr.example.test/fallback',
      ext: { sesameDvr: { streamName: 'configured-name' } },
    } as RbtCamera;

    expect(cameraStreamName(camera)).toBe('configured-name');
  });

  test('prefills supported issue template fields with device context', () => {
    expect(issueTemplateModels({
      first: 'project',
      second: 'subject',
      third: 'description',
      fourth: '_cf_priority',
    }, {
      subject: 'Camera #7',
      description: 'Model and address',
    })).toEqual({
      subject: 'Camera #7',
      description: 'Model and address',
      _cf_priority: '',
    });
  });

  test('hides issue projects and workflows missing from available metadata', () => {
    const workflows = {
      available: { name: 'Available', catalog: { General: { 0: 'General issue' } } },
      empty: { name: 'Empty', catalog: {} },
    } as Workflows;
    const unavailableProject = {
      projectId: 1,
      project: 'Unavailable',
      workflows: ['missing', 'empty'],
    } as Project;
    const availableProject = {
      projectId: 2,
      project: 'Available',
      workflows: ['missing', 'empty', 'available'],
    } as Project;

    expect(availableIssueProjects(
      [unavailableProject, availableProject],
      workflows,
    )).toEqual([availableProject]);
    expect(availableIssueWorkflows(availableProject, workflows)).toEqual(['available']);
  });
});
