import React, { useMemo, useState } from 'react';
import { BookOpen, Search, Wand2, X } from 'lucide-react';
import {
  ALL_SPELL_SCHOOLS,
  DIABLO_SPELLS_CATALOG,
  HeroCharacter,
  SPELL_SCHOOL_LABELS,
  SpellSchool,
} from '../data/models';
import { GothicCard } from '../components/GothicCard';

interface SpellbookScreenProps {
  hero: HeroCharacter;
  onSetSpellLevel: (spellId: string, level: number) => void;
  onMaxAllSpells: () => void;
}

function getSchoolColor(school: SpellSchool): string {
  switch (school) {
    case SpellSchool.FIRE:
      return '#EE3535';
    case SpellSchool.LIGHTNING:
      return '#FFD464';
    case SpellSchool.ARCANE:
      return '#5AA1FF';
    case SpellSchool.FORBIDDEN:
      return '#C062FF';
    case SpellSchool.HELLFIRE:
      return '#FF8E3D';
  }
}

export const SpellbookScreen: React.FC<SpellbookScreenProps> = ({
  hero,
  onSetSpellLevel,
  onMaxAllSpells,
}) => {
  const [selectedSchool, setSelectedSchool] = useState<SpellSchool | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSpells = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return DIABLO_SPELLS_CATALOG.filter((spell) => {
      const matchSchool =
        selectedSchool === null || spell.school === selectedSchool;
      const matchSearch =
        !q ||
        spell.name.toLowerCase().includes(q) ||
        spell.description.toLowerCase().includes(q);
      return matchSchool && matchSearch;
    });
  }, [selectedSchool, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Spellbook Header & Filter Bar */}
      <GothicCard borderColor="#17427C">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-[#5AA1FF]" />
            <h1 className="font-display text-lg font-bold text-[#5AA1FF]">
              Diablo Spellbook
            </h1>
          </div>

          <button
            type="button"
            onClick={onMaxAllSpells}
            className="inline-flex items-center gap-2 rounded-lg border border-[#2D7BDE] bg-[#2C221F] px-3.5 py-2 text-xs font-semibold text-[#5AA1FF] whitespace-nowrap transition-colors hover:bg-[#17427C] hover:text-white"
          >
            <Wand2 className="h-3.5 w-3.5" />
            <span>Max All (15)</span>
          </button>
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A59B93]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search spells (e.g. Apocalypse, Firewall, Teleport)"
            className="w-full rounded-lg border border-[#3B2F2A] bg-[#0C0908] py-2.5 pl-10 pr-10 text-sm text-[#E8E0D5] placeholder-[#A59B93]/60 focus:border-[#2D7BDE] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear spell search"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A59B93] hover:text-[#E8E0D5]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedSchool(null)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedSchool === null
                ? 'border-[#5AA1FF] bg-[#17427C] text-white'
                : 'border-[#3B2F2A] bg-[#2C221F] text-[#A59B93] hover:text-[#E8E0D5]'
            }`}
          >
            All ({DIABLO_SPELLS_CATALOG.length})
          </button>
          {ALL_SPELL_SCHOOLS.map((school) => {
            const count = DIABLO_SPELLS_CATALOG.filter(
              (s) => s.school === school
            ).length;
            const active = selectedSchool === school;
            return (
              <button
                key={school}
                type="button"
                onClick={() => setSelectedSchool(active ? null : school)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? 'border-[#5AA1FF] bg-[#17427C] text-white'
                    : 'border-[#3B2F2A] bg-[#2C221F] text-[#A59B93] hover:text-[#E8E0D5]'
                }`}
              >
                {SPELL_SCHOOL_LABELS[school]} ({count})
              </button>
            );
          })}
        </div>
      </GothicCard>

      {/* Spells Grid */}
      {filteredSpells.length === 0 ? (
        <GothicCard className="py-10 text-center">
          <p className="text-sm text-[#A59B93]">
            No spells match "{searchQuery}".
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedSchool(null);
            }}
            className="mt-3 rounded-lg border border-[#3B2F2A] bg-[#2C221F] px-4 py-2 text-xs font-semibold text-[#5AA1FF] hover:border-[#2D7BDE]"
          >
            Reset Filters
          </button>
        </GothicCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredSpells.map((spell) => {
            const currentLevel = hero.spellLevels[spell.id] ?? 0;
            const schoolColor = getSchoolColor(spell.school);

            return (
              <GothicCard
                key={spell.id}
                borderColor={
                  currentLevel > 0 ? `${schoolColor}80` : '#3B2F2A'
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h3
                        className="font-display text-base font-bold"
                        style={{
                          color: currentLevel > 0 ? schoolColor : '#E8E0D5',
                        }}
                      >
                        {spell.name}
                      </h3>
                      <span className="font-mono-tabular text-xs text-[#A59B93]">
                        Mana: {spell.manaCost}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[#A59B93]">
                      {spell.description}
                    </p>
                  </div>

                  <span
                    className={`font-mono-tabular shrink-0 rounded-md px-2.5 py-1 text-xs font-bold ${
                      currentLevel > 0
                        ? 'bg-[#2C221F]'
                        : 'bg-[#221B18] text-[#A59B93]'
                    }`}
                    style={{
                      color:
                        currentLevel === 15
                          ? '#FFD464'
                          : currentLevel > 0
                            ? '#E8E0D5'
                            : undefined,
                    }}
                  >
                    {currentLevel > 0 ? `Lv ${currentLevel}` : 'Not Learned'}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <input
                    type="range"
                    aria-label={`${spell.name} level`}
                    min={0}
                    max={15}
                    value={currentLevel}
                    onChange={(e) =>
                      onSetSpellLevel(spell.id, Number(e.target.value))
                    }
                    className="flex-1 cursor-pointer"
                    style={{ accentColor: schoolColor }}
                  />

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        onSetSpellLevel(
                          spell.id,
                          Math.max(0, currentLevel - 1)
                        )
                      }
                      className="font-mono-tabular h-8 w-8 rounded-md border border-[#3B2F2A] bg-[#2C221F] text-xs font-bold text-[#E8E0D5] hover:border-[#9E7422]"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onSetSpellLevel(
                          spell.id,
                          Math.min(15, currentLevel + 1)
                        )
                      }
                      className="font-mono-tabular h-8 w-8 rounded-md border border-[#3B2F2A] bg-[#2C221F] text-xs font-bold text-[#E8E0D5] hover:border-[#9E7422]"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetSpellLevel(spell.id, 15)}
                      className="font-mono-tabular h-8 rounded-md border border-[#9E7422] bg-[#2C221F] px-2.5 text-xs font-bold text-[#FFD464] hover:bg-[#9E7422] hover:text-[#0C0908]"
                    >
                      15
                    </button>
                  </div>
                </div>
              </GothicCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
