'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import type { HubConnection } from '@microsoft/signalr';
import { Wifi, WifiOff, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import clsx from 'clsx';
import { apiFetch } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import type { PollType, PollResults as PollResultsType, PollResultOption } from '@/lib/types';

type PollResultsProps = {
  pollId: string;
  pollType: PollType;
};

type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

export function PollResults({ pollId, pollType }: PollResultsProps) {
  const t = useTranslations('polls.results');

  const [results, setResults] = useState<PollResultsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [expandedOptions, setExpandedOptions] = useState<Set<string>>(new Set());
  const connectionRef = useRef<HubConnection | null>(null);

  const fetchResults = useCallback(async () => {
    try {
      const data = await apiFetch<PollResultsType>(`/api/polls/${pollId}/results`);
      setResults(data);
    } catch {
      // Silently fail - will retry via SignalR
    } finally {
      setLoading(false);
    }
  }, [pollId]);

  // Fetch initial results
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // SignalR connection
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl('/hubs/polls')
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    connection.onreconnecting(() => {
      setConnectionStatus('reconnecting');
    });

    connection.onreconnected(() => {
      setConnectionStatus('connected');
      // Rejoin the poll group after reconnect
      connection.invoke('JoinPollGroup', pollId).catch(() => {});
    });

    connection.onclose(() => {
      setConnectionStatus('disconnected');
    });

    // Listen for vote updates
    connection.on('VoteReceived', (updatedResults: PollResultsType) => {
      setResults(updatedResults);
    });

    const startConnection = async () => {
      try {
        await connection.start();
        setConnectionStatus('connected');
        await connection.invoke('JoinPollGroup', pollId);
      } catch {
        setConnectionStatus('disconnected');
        // Retry after 5 seconds
        setTimeout(startConnection, 5000);
      }
    };

    startConnection();

    return () => {
      if (connection.state === HubConnectionState.Connected) {
        connection.invoke('LeavePollGroup', pollId).catch(() => {});
      }
      connection.stop();
    };
  }, [pollId]);

  const toggleVoters = (optionId: string) => {
    setExpandedOptions((prev) => {
      const next = new Set(prev);
      if (next.has(optionId)) {
        next.delete(optionId);
      } else {
        next.add(optionId);
      }
      return next;
    });
  };

  const connectionStatusConfig: Record<ConnectionStatus, { label: string; className: string }> = {
    connected: { label: t('connected'), className: 'text-green-500' },
    disconnected: { label: t('disconnected'), className: 'text-neutral-400' },
    reconnecting: { label: t('reconnecting'), className: 'text-yellow-500' },
  };

  if (loading) {
    return (
      <Card glass className="animate-pulse p-8">
        <div className="h-4 w-32 rounded bg-[var(--muted)]" />
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 rounded bg-[var(--muted)]" />
              <div className="h-6 w-full rounded-full bg-[var(--muted)]" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!results) return null;

  // Sort options: by voteCount (desc) for standard polls, by averageRank (asc) for ranked
  const sortedOptions = [...results.options].sort((a, b) => {
    if (pollType === 'Ranked' && a.averageRank != null && b.averageRank != null) {
      return a.averageRank - b.averageRank;
    }
    return b.voteCount - a.voteCount;
  });

  const maxVotes = Math.max(...results.options.map((o) => o.voteCount), 1);

  return (
    <Card glass>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold">{t('title')}</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--muted-foreground)]">
            {t('liveUpdates')}
          </span>
          <span className={clsx('flex items-center gap-1 text-xs', connectionStatusConfig[connectionStatus].className)}>
            {connectionStatus === 'connected' ? (
              <Wifi className="h-3.5 w-3.5" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" />
            )}
            {connectionStatusConfig[connectionStatus].label}
          </span>
        </div>
      </div>

      {/* Total votes */}
      <p className="mb-4 text-sm text-[var(--muted-foreground)]">
        {t('totalVotes', { count: results.totalVoters })}
      </p>

      {/* No votes */}
      {results.totalVoters === 0 && (
        <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
          {t('noVotes')}
        </p>
      )}

      {/* Results */}
      {results.totalVoters > 0 && (
        <div className="space-y-4">
          {sortedOptions.map((option, index) => (
            <ResultOption
              key={option.id}
              option={option}
              index={index}
              maxVotes={maxVotes}
              totalVotes={results.totalVoters}
              pollType={pollType}
              isExpanded={expandedOptions.has(option.id)}
              onToggleVoters={() => toggleVoters(option.id)}
              isLeader={index === 0 && option.voteCount > 0}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

type ResultOptionProps = {
  option: PollResultOption;
  index: number;
  maxVotes: number;
  totalVotes: number;
  pollType: PollType;
  isExpanded: boolean;
  onToggleVoters: () => void;
  isLeader: boolean;
};

function ResultOption({
  option,
  maxVotes,
  totalVotes,
  pollType,
  isExpanded,
  onToggleVoters,
  isLeader,
}: ResultOptionProps) {
  const t = useTranslations('polls.results');

  const barWidth = totalVotes > 0 ? (option.voteCount / maxVotes) * 100 : 0;

  return (
    <div className="space-y-1.5">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLeader && <Trophy className="h-4 w-4 text-yellow-500" />}
          <span className="text-sm font-medium">{option.text}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          {pollType === 'Ranked' && option.averageRank != null && (
            <span>{t('averageRank', { rank: option.averageRank.toFixed(1) })}</span>
          )}
          <span className="font-semibold tabular-nums">
            {option.voteCount}
          </span>
          <span>
            ({t('percentage', { value: totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0 })})
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-700 ease-out',
            isLeader ? 'gradient-primary' : 'bg-[var(--primary)]/60',
          )}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {/* Voter list toggle */}
      {(option.voters ?? []).length > 0 && (
        <div>
          <button
            onClick={onToggleVoters}
            className="inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                {t('hideVoters')}
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                {t('showVoters')} ({(option.voters ?? []).length})
              </>
            )}
          </button>
          {isExpanded && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {(option.voters ?? []).map((voter, i) => (
                <span
                  key={i}
                  className="rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-xs text-[var(--muted-foreground)]"
                >
                  {voter}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
