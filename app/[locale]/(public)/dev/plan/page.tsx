'use client';

import { useMemo, useState } from 'react';
import { PlanCover } from '@/components/plan2d/plan-cover';
import { PlanViewer } from '@/components/plan2d/plan-viewer';
import { Badge } from '@/components/ui/badge';
import { buildHouse, measure, pickStairs, toSvg, validateHouse, drawFloor } from '@/lib/geometry';
import { formatArea } from '@/lib/formatters';
import { BOUNDS, GROUND_FLOOR, NAMES, RULES, UPPER_FLOOR } from './fixture';
import { useIssueText } from '@/hooks/use-issue-text';

/**
 * 2D chizmani tekshirish sahifasi.
 *
 * Serverga bog'liq emas — geometriya to'liq brauzerda quriladi. Shu
 * sababli chizmadagi xatolikni API'siz ham ko'rish mumkin.
 */

export default function DevPlanPage() {
  const issueText = useIssueText('geometry');
  const [floors, setFloors] = useState(2);
  const [garage, setGarage] = useState(true);

  const { house, validation, measurements, cover } = useMemo(() => {
    const trees = floors === 1 ? [GROUND_FLOOR] : [GROUND_FLOOR, UPPER_FLOOR];
    const stairs = trees.length > 1 ? pickStairs(GROUND_FLOOR, BOUNDS) : undefined;

    const { house } = buildHouse(
      {
        bounds: BOUNDS,
        floors: trees.map((tree, index) => ({ level: index + 1, tree, stairs })),
        roof: { type: 'gable', pitch: 25, overhang: 0.5 },
        extras: garage ? [{ kind: 'garage', count: 1 }, { kind: 'terrace' }] : [],
      },
      { rules: RULES },
    );

    return {
      house,
      validation: validateHouse(house, { rules: RULES }),
      measurements: measure(house),
      cover: toSvg(drawFloor(house.floors[0], { names: NAMES, extras: house.extras }), {
        scale: 20,
      }),
    };
  }, [floors, garage]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">2D chizma tekshiruvi</h1>
          <p className="text-sm text-muted-foreground">
            {formatArea(measurements.FLOOR_AREA)} · {measurements.FLOOR_COUNT} qavat ·{' '}
            {measurements.ROOM_COUNT} xona · sifat {validation.score}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFloors((value) => (value === 1 ? 2 : 1))}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted"
          >
            Qavat: {floors}
          </button>
          <button
            type="button"
            onClick={() => setGarage((value) => !value)}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted"
          >
            Garaj: {garage ? 'bor' : "yo'q"}
          </button>
        </div>
      </header>

      {validation.issues.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {validation.issues.map((issue, index) => (
            <Badge key={index} variant={issue.severity === 'error' ? 'destructive' : 'secondary'}>
              {issueText(issue.code, issue.values)}
            </Badge>
          ))}
        </div>
      )}

      <PlanViewer house={house} names={NAMES} />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Muqova (server chizgan SVG bilan bir xil yo&apos;l)
        </h2>
        <PlanCover svg={cover} className="max-w-xs" />
      </section>
    </div>
  );
}
