/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  sampleRuleAlertParams,
  sampleDocNoSortId,
  sampleRuleGuid,
  sampleIdGuid,
} from './__mocks__/es_results';
import { buildBulkBody } from './build_bulk_body';
import { SignalHit } from './types';

describe('buildBulkBody', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('if bulk body builds well-defined body', () => {
    const sampleParams = sampleRuleAlertParams();
    const fakeSignalSourceHit = buildBulkBody({
      doc: sampleDocNoSortId(),
      ruleParams: sampleParams,
      id: sampleRuleGuid,
      name: 'rule-name',
      actions: [],
      createdAt: '2020-01-28T15:58:34.810Z',
      updatedAt: '2020-01-28T15:59:14.004Z',
      createdBy: 'elastic',
      updatedBy: 'elastic',
      interval: '5m',
      enabled: true,
      tags: ['some fake tag 1', 'some fake tag 2'],
      throttle: 'no_actions',
    });
    // Timestamp will potentially always be different so remove it for the test
    delete fakeSignalSourceHit['@timestamp'];
    const expected: Omit<SignalHit, '@timestamp'> & { someKey: 'someValue' } = {
      someKey: 'someValue',
      event: {
        kind: 'signal',
      },
      signal: {
        parent: {
          rule: '04128c15-0d1b-4716-a4c5-46997ac7f3bd',
          id: sampleIdGuid,
          type: 'event',
          index: 'myFakeSignalIndex',
          depth: 1,
        },
        ancestors: [
          {
            rule: '04128c15-0d1b-4716-a4c5-46997ac7f3bd',
            id: sampleIdGuid,
            type: 'event',
            index: 'myFakeSignalIndex',
            depth: 1,
          },
        ],
        original_time: 'someTimeStamp',
        status: 'open',
        rule: {
          actions: [],
          id: '04128c15-0d1b-4716-a4c5-46997ac7f3bd',
          rule_id: 'rule-1',
          false_positives: [],
          max_signals: 10000,
          risk_score: 50,
          output_index: '.siem-signals',
          description: 'Detecting root and admin users',
          from: 'now-6m',
          immutable: false,
          index: ['auditbeat-*', 'filebeat-*', 'packetbeat-*', 'winlogbeat-*'],
          interval: '5m',
          language: 'kuery',
          name: 'rule-name',
          query: 'user.name: root or user.name: admin',
          references: ['http://google.com'],
          severity: 'high',
          tags: ['some fake tag 1', 'some fake tag 2'],
          throttle: 'no_actions',
          type: 'query',
          to: 'now',
          note: '',
          enabled: true,
          created_by: 'elastic',
          updated_by: 'elastic',
          version: 1,
          created_at: fakeSignalSourceHit.signal.rule?.created_at,
          updated_at: fakeSignalSourceHit.signal.rule?.updated_at,
          lists: [
            {
              field: 'source.ip',
              values_operator: 'included',
              values_type: 'exists',
            },
            {
              field: 'host.name',
              values_operator: 'excluded',
              values_type: 'match',
              values: [
                {
                  name: 'rock01',
                },
              ],
              and: [
                {
                  field: 'host.id',
                  values_operator: 'included',
                  values_type: 'match_all',
                  values: [
                    {
                      name: '123',
                    },
                    {
                      name: '678',
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    };
    expect(fakeSignalSourceHit).toEqual(expected);
  });

  test('if bulk body builds original_event if it exists on the event to begin with', () => {
    const sampleParams = sampleRuleAlertParams();
    const doc = sampleDocNoSortId();
    doc._source.event = {
      action: 'socket_opened',
      module: 'system',
      dataset: 'socket',
      kind: 'event',
    };
    const fakeSignalSourceHit = buildBulkBody({
      doc,
      ruleParams: sampleParams,
      id: sampleRuleGuid,
      name: 'rule-name',
      actions: [],
      createdAt: '2020-01-28T15:58:34.810Z',
      updatedAt: '2020-01-28T15:59:14.004Z',
      createdBy: 'elastic',
      updatedBy: 'elastic',
      interval: '5m',
      enabled: true,
      tags: ['some fake tag 1', 'some fake tag 2'],
      throttle: 'no_actions',
    });
    // Timestamp will potentially always be different so remove it for the test
    delete fakeSignalSourceHit['@timestamp'];
    const expected: Omit<SignalHit, '@timestamp'> & { someKey: 'someValue' } = {
      someKey: 'someValue',
      event: {
        action: 'socket_opened',
        dataset: 'socket',
        kind: 'signal',
        module: 'system',
      },
      signal: {
        original_event: {
          action: 'socket_opened',
          dataset: 'socket',
          kind: 'event',
          module: 'system',
        },
        parent: {
          rule: '04128c15-0d1b-4716-a4c5-46997ac7f3bd',
          id: sampleIdGuid,
          type: 'event',
          index: 'myFakeSignalIndex',
          depth: 1,
        },
        ancestors: [
          {
            rule: '04128c15-0d1b-4716-a4c5-46997ac7f3bd',
            id: sampleIdGuid,
            type: 'event',
            index: 'myFakeSignalIndex',
            depth: 1,
          },
        ],
        original_time: 'someTimeStamp',
        status: 'open',
        rule: {
          actions: [],
          id: '04128c15-0d1b-4716-a4c5-46997ac7f3bd',
          rule_id: 'rule-1',
          false_positives: [],
          max_signals: 10000,
          risk_score: 50,
          output_index: '.siem-signals',
          description: 'Detecting root and admin users',
          from: 'now-6m',
          immutable: false,
          index: ['auditbeat-*', 'filebeat-*', 'packetbeat-*', 'winlogbeat-*'],
          interval: '5m',
          language: 'kuery',
          name: 'rule-name',
          query: 'user.name: root or user.name: admin',
          references: ['http://google.com'],
          severity: 'high',
          tags: ['some fake tag 1', 'some fake tag 2'],
          type: 'query',
          to: 'now',
          note: '',
          enabled: true,
          created_by: 'elastic',
          updated_by: 'elastic',
          version: 1,
          created_at: fakeSignalSourceHit.signal.rule?.created_at,
          updated_at: fakeSignalSourceHit.signal.rule?.updated_at,
          throttle: 'no_actions',
          lists: [
            {
              field: 'source.ip',
              values_operator: 'included',
              values_type: 'exists',
            },
            {
              field: 'host.name',
              values_operator: 'excluded',
              values_type: 'match',
              values: [
                {
                  name: 'rock01',
                },
              ],
              and: [
                {
                  field: 'host.id',
                  values_operator: 'included',
                  values_type: 'match_all',
                  values: [
                    {
                      name: '123',
                    },
                    {
                      name: '678',
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    };
    expect(fakeSignalSourceHit).toEqual(expected);
  });

  test('if bulk body builds original_event if it exists on the event to begin with but no kind information', () => {
    const sampleParams = sampleRuleAlertParams();
    const doc = sampleDocNoSortId();
    doc._source.event = {
      action: 'socket_opened',
      module: 'system',
      dataset: 'socket',
    };
    const fakeSignalSourceHit = buildBulkBody({
      doc,
      ruleParams: sampleParams,
      id: sampleRuleGuid,
      name: 'rule-name',
      actions: [],
      createdAt: '2020-01-28T15:58:34.810Z',
      updatedAt: '2020-01-28T15:59:14.004Z',
      createdBy: 'elastic',
      updatedBy: 'elastic',
      interval: '5m',
      enabled: true,
      tags: ['some fake tag 1', 'some fake tag 2'],
      throttle: 'no_actions',
    });
    // Timestamp will potentially always be different so remove it for the test
    delete fakeSignalSourceHit['@timestamp'];
    const expected: Omit<SignalHit, '@timestamp'> & { someKey: 'someValue' } = {
      someKey: 'someValue',
      event: {
        action: 'socket_opened',
        dataset: 'socket',
        kind: 'signal',
        module: 'system',
      },
      signal: {
        original_event: {
          action: 'socket_opened',
          dataset: 'socket',
          module: 'system',
        },
        parent: {
          rule: '04128c15-0d1b-4716-a4c5-46997ac7f3bd',
          id: sampleIdGuid,
          type: 'event',
          index: 'myFakeSignalIndex',
          depth: 1,
        },
        ancestors: [
          {
            rule: '04128c15-0d1b-4716-a4c5-46997ac7f3bd',
            id: sampleIdGuid,
            type: 'event',
            index: 'myFakeSignalIndex',
            depth: 1,
          },
        ],
        original_time: 'someTimeStamp',
        status: 'open',
        rule: {
          actions: [],
          id: '04128c15-0d1b-4716-a4c5-46997ac7f3bd',
          rule_id: 'rule-1',
          false_positives: [],
          max_signals: 10000,
          risk_score: 50,
          output_index: '.siem-signals',
          description: 'Detecting root and admin users',
          from: 'now-6m',
          immutable: false,
          index: ['auditbeat-*', 'filebeat-*', 'packetbeat-*', 'winlogbeat-*'],
          interval: '5m',
          language: 'kuery',
          name: 'rule-name',
          query: 'user.name: root or user.name: admin',
          references: ['http://google.com'],
          severity: 'high',
          tags: ['some fake tag 1', 'some fake tag 2'],
          type: 'query',
          to: 'now',
          note: '',
          enabled: true,
          created_by: 'elastic',
          updated_by: 'elastic',
          version: 1,
          created_at: fakeSignalSourceHit.signal.rule?.created_at,
          updated_at: fakeSignalSourceHit.signal.rule?.updated_at,
          throttle: 'no_actions',
          lists: [
            {
              field: 'source.ip',
              values_operator: 'included',
              values_type: 'exists',
            },
            {
              field: 'host.name',
              values_operator: 'excluded',
              values_type: 'match',
              values: [
                {
                  name: 'rock01',
                },
              ],
              and: [
                {
                  field: 'host.id',
                  values_operator: 'included',
                  values_type: 'match_all',
                  values: [
                    {
                      name: '123',
                    },
                    {
                      name: '678',
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    };
    expect(fakeSignalSourceHit).toEqual(expected);
  });

  test('if bulk body builds original_event if it exists on the event to begin with with only kind information', () => {
    const sampleParams = sampleRuleAlertParams();
    const doc = sampleDocNoSortId();
    doc._source.event = {
      kind: 'event',
    };
    const fakeSignalSourceHit = buildBulkBody({
      doc,
      ruleParams: sampleParams,
      id: sampleRuleGuid,
      name: 'rule-name',
      actions: [],
      createdAt: '2020-01-28T15:58:34.810Z',
      updatedAt: '2020-01-28T15:59:14.004Z',
      createdBy: 'elastic',
      updatedBy: 'elastic',
      interval: '5m',
      enabled: true,
      tags: ['some fake tag 1', 'some fake tag 2'],
      throttle: 'no_actions',
    });
    // Timestamp will potentially always be different so remove it for the test
    delete fakeSignalSourceHit['@timestamp'];
    const expected: Omit<SignalHit, '@timestamp'> & { someKey: 'someValue' } = {
      someKey: 'someValue',
      event: {
        kind: 'signal',
      },
      signal: {
        original_event: {
          kind: 'event',
        },
        parent: {
          rule: '04128c15-0d1b-4716-a4c5-46997ac7f3bd',
          id: sampleIdGuid,
          type: 'event',
          index: 'myFakeSignalIndex',
          depth: 1,
        },
        ancestors: [
          {
            rule: '04128c15-0d1b-4716-a4c5-46997ac7f3bd',
            id: sampleIdGuid,
            type: 'event',
            index: 'myFakeSignalIndex',
            depth: 1,
          },
        ],
        original_time: 'someTimeStamp',
        status: 'open',
        rule: {
          actions: [],
          id: '04128c15-0d1b-4716-a4c5-46997ac7f3bd',
          rule_id: 'rule-1',
          false_positives: [],
          max_signals: 10000,
          risk_score: 50,
          output_index: '.siem-signals',
          description: 'Detecting root and admin users',
          from: 'now-6m',
          immutable: false,
          index: ['auditbeat-*', 'filebeat-*', 'packetbeat-*', 'winlogbeat-*'],
          interval: '5m',
          language: 'kuery',
          name: 'rule-name',
          query: 'user.name: root or user.name: admin',
          references: ['http://google.com'],
          severity: 'high',
          tags: ['some fake tag 1', 'some fake tag 2'],
          type: 'query',
          to: 'now',
          note: '',
          enabled: true,
          created_by: 'elastic',
          updated_by: 'elastic',
          version: 1,
          updated_at: fakeSignalSourceHit.signal.rule?.updated_at,
          created_at: fakeSignalSourceHit.signal.rule?.created_at,
          throttle: 'no_actions',
          lists: [
            {
              field: 'source.ip',
              values_operator: 'included',
              values_type: 'exists',
            },
            {
              field: 'host.name',
              values_operator: 'excluded',
              values_type: 'match',
              values: [
                {
                  name: 'rock01',
                },
              ],
              and: [
                {
                  field: 'host.id',
                  values_operator: 'included',
                  values_type: 'match_all',
                  values: [
                    {
                      name: '123',
                    },
                    {
                      name: '678',
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    };
    expect(fakeSignalSourceHit).toEqual(expected);
  });
});
