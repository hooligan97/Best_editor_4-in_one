import { useEffect, useRef, useState } from 'react';
import {
  Backpack,
  BookOpen,
  ChevronDown,
  Diamond,
  Dumbbell,
  Flame,
  FolderCog,
  HeartPulse,
  Share2,
  Shield,
  User,
  Wand2,
  X,
} from 'lucide-react';
import {
  ALL_GAME_MODS,
  GAME_MOD_META,
  GameMod,
  HERO_CLASS_META,
} from './data/models';
import {
  ALL_EDITOR_TABS,
  EDITOR_TAB_META,
  EditorTab,
  useCharacterEditor,
} from './hooks/useCharacterEditor';
import { HeroOverviewScreen } from './screens/HeroOverviewScreen';
import { StatsScreen } from './screens/StatsScreen';
import { SpellbookScreen } from './screens/SpellbookScreen';
import { InventoryScreen } from './screens/InventoryScreen';
import { ArmoryScreen } from './screens/ArmoryScreen';
import { SaveManagerScreen } from './screens/SaveManagerScreen';

function getTabIcon(tab: EditorTab) {
  switch (tab) {
    case EditorTab.HERO:
      return <User className="h-4 w-4" />;
    case EditorTab.STATS:
      return <Dumbbell className="h-4 w-4" />;
    case EditorTab.SPELLS:
      return <BookOpen className="h-4 w-4" />;
    case EditorTab.INVENTORY:
      return <Backpack className="h-4 w-4" />;
    case EditorTab.ARMORY:
      return <Shield className="h-4 w-4" />;
    case EditorTab.SAVES:
      return <FolderCog className="h-4 w-4" />;
  }
}

function getModIcon(mod: GameMod) {
  switch (mod) {
    case GameMod.VANILLA_DIABLO:
      return <Shield className="h-4 w-4" />;
    case GameMod.HELLFIRE:
      return <Flame className="h-4 w-4" />;
    case GameMod.VKD_MOD:
      return <Wand2 className="h-4 w-4" />;
    case GameMod.MIDDLE_EARTH:
      return <Diamond className="h-4 w-4" />;
  }
}

export function App() {
  const editor = useCharacterEditor();
  const { character, activeTab, statusMessage } = editor;
  const [showModMenu, setShowModMenu] = useState(false);
  const modMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        modMenuRef.current &&
        !modMenuRef.current.contains(e.target as Node)
      ) {
        setShowModMenu(false);
      }
    };
    if (showModMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showModMenu]);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(editor.getNoctonicJson());
      editor.showMessage('Noctonic JSON copied to clipboard!');
    } catch {
      editor.showMessage(
        'Clipboard access unavailable — export JSON from Saves & MPQ.'
      );
    }
  };

  const modMeta = GAME_MOD_META[character.gameMod];
  const classMeta = HERO_CLASS_META[character.heroClass];

  return (
    <div className="min-h-screen bg-[#0C0908] text-[#E8E0D5] pb-20 md:pb-10">
      {/* Top Bar: 3-Zone Contract */}
      <header className="sticky top-0 z-30 border-b border-[#3B2F2A] bg-[#161210]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => editor.selectTab(EditorTab.HERO)}
            className="font-display text-lg font-bold tracking-wide text-[#FFD464] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#FFD464]"
          >
            DevilutionX Editor
          </button>

          {/* Zone 2: Single-line Navigation Links */}
          <nav
            aria-label="Primary sections"
            className="hidden items-center gap-6 md:flex"
          >
            {ALL_EDITOR_TABS.map((tab) => {
              const isSelected = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => editor.selectTab(tab)}
                  className={`border-b-2 py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                    isSelected
                      ? 'border-[#FFD464] text-[#FFD464]'
                      : 'border-transparent text-[#A59B93] hover:text-[#E8E0D5]'
                  }`}
                >
                  {EDITOR_TAB_META[tab].title}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-2 rounded-lg bg-[#9E7422] px-4 py-2 text-xs font-bold text-[#FFD464] whitespace-nowrap shrink-0 transition-colors hover:bg-[#E5B044] hover:text-[#0C0908]"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Copy JSON</span>
            </button>
          </div>
        </div>
      </header>

      {/* Workspace Context Bar (Hero Summary, SP/MP Switch, Mod Switcher, Full Heal) */}
      <div className="border-b border-[#3B2F2A] bg-[#161210]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#A59B93]">
            <span className="font-semibold text-[#E8E0D5]">
              {character.name || 'Hero'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">
              Lv {character.level} {classMeta.displayName}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular text-[#E5B044]">
              {character.gold.toLocaleString()}g
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* SP / MP Mode Switch */}
            <button
              type="button"
              onClick={editor.toggleMultiplayer}
              className={`rounded-md border px-2.5 py-1.5 font-mono-tabular text-xs font-bold whitespace-nowrap transition-colors ${
                character.isMultiplayer
                  ? 'border-[#EE3535] bg-[#751212] text-white'
                  : 'border-[#3B2F2A] bg-[#2C221F] text-[#A59B93] hover:text-[#E8E0D5]'
              }`}
            >
              {character.isMultiplayer
                ? `MP Slot #${character.multiplayerSlot}`
                : 'SP Mode'}
            </button>

            {/* Mod Switcher Dropdown */}
            <div ref={modMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setShowModMenu((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors ${
                  modMeta.isMod
                    ? 'border-[#EE3535] bg-[#751212] text-[#FFD464]'
                    : 'border-[#3B2F2A] bg-[#2C221F] text-[#FFD464] hover:border-[#9E7422]'
                }`}
              >
                <span>{modMeta.shortName}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {showModMenu && (
                <div className="absolute right-0 z-40 mt-1.5 w-64 rounded-xl border border-[#3B2F2A] bg-[#2C221F] p-1.5 shadow-xl">
                  {ALL_GAME_MODS.map((mod) => {
                    const m = GAME_MOD_META[mod];
                    const selected = character.gameMod === mod;
                    return (
                      <button
                        key={mod}
                        type="button"
                        onClick={() => {
                          editor.setGameMod(mod);
                          setShowModMenu(false);
                        }}
                        className={`flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ${
                          selected
                            ? 'bg-[#221B18] text-[#FFD464]'
                            : 'text-[#E8E0D5] hover:bg-[#221B18]'
                        }`}
                      >
                        <span
                          className={`mt-0.5 ${
                            selected ? 'text-[#FFD464]' : 'text-[#A59B93]'
                          }`}
                        >
                          {getModIcon(mod)}
                        </span>
                        <div>
                          <div className="text-xs font-bold">
                            {m.displayName}
                          </div>
                          <div className="text-[11px] text-[#A59B93]">
                            {m.subtitle}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Full Heal Action */}
            <button
              type="button"
              onClick={editor.fullHeal}
              title="Full Rejuvenate Life & Mana"
              className="inline-flex items-center gap-1.5 rounded-md border border-[#751212] bg-[#2C221F] px-3 py-1.5 text-xs font-semibold text-[#EE3535] whitespace-nowrap transition-colors hover:bg-[#751212] hover:text-white"
            >
              <HeartPulse className="h-3.5 w-3.5" />
              <span>Rejuvenate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {activeTab === EditorTab.HERO && (
          <HeroOverviewScreen
            hero={character}
            onUpdateName={editor.updateName}
            onUpdateHeroClass={editor.updateHeroClass}
            onSetGameMod={editor.setGameMod}
            onSetIsMultiplayer={editor.setIsMultiplayer}
            onSetMultiplayerSlot={editor.setMultiplayerSlot}
            onSetUnlockedDifficulties={editor.setUnlockedDifficulties}
            onMaxStats={editor.maxOutAllStats}
            onMaxSpells={editor.maxAllSpells}
            onMaxGold={editor.maxGold}
            onUpdateLevel={editor.updateLevel}
            onUpdateGold={editor.updateGold}
            onUpdateDifficulty={editor.updateDifficulty}
            onUpdateDungeonLevel={editor.updateDungeonLevel}
          />
        )}

        {activeTab === EditorTab.STATS && (
          <StatsScreen
            hero={character}
            onFullHeal={editor.fullHeal}
            onToggleManaShield={editor.toggleManaShield}
            onUpdateLife={editor.updateLife}
            onUpdateMana={editor.updateMana}
            onModifyStat={editor.modifyStat}
          />
        )}

        {activeTab === EditorTab.SPELLS && (
          <SpellbookScreen
            hero={character}
            onSetSpellLevel={editor.setSpellLevel}
            onMaxAllSpells={editor.maxAllSpells}
          />
        )}

        {activeTab === EditorTab.INVENTORY && (
          <InventoryScreen
            hero={character}
            onEquipItem={editor.equipItem}
            onUnequipItem={editor.unequipItem}
            onAddItemToInventory={editor.addItemToInventory}
            onRemoveItemFromInventory={editor.removeItemFromInventory}
            onEquipRecommendedLoadout={editor.equipRecommendedLoadout}
            onFillBeltWithPotions={editor.fillBeltWithPotions}
            onSetBeltSlot={editor.setBeltSlot}
            onGoToArmory={() => editor.selectTab(EditorTab.ARMORY)}
          />
        )}

        {activeTab === EditorTab.ARMORY && (
          <ArmoryScreen
            hero={character}
            onEquipItem={editor.equipItem}
            onAddItemToInventory={editor.addItemToInventory}
            onEquipRecommendedLoadout={editor.equipRecommendedLoadout}
          />
        )}

        {activeTab === EditorTab.SAVES && (
          <SaveManagerScreen
            hero={character}
            mpqInfo={editor.mpqInfo}
            hexDump={editor.hexDump}
            vault={editor.vault}
            onSetIsMultiplayer={editor.setIsMultiplayer}
            onSetMultiplayerSlot={editor.setMultiplayerSlot}
            onSetGameMod={editor.setGameMod}
            onImportSaveBytes={editor.importSaveBytes}
            onExportSaveMpqBytes={editor.exportSaveMpqBytes}
            onImportNoctonicJson={editor.importNoctonicJson}
            onGetNoctonicJson={editor.getNoctonicJson}
            onInspectBytes={editor.inspectBytes}
            onSaveToVault={editor.saveToVault}
            onLoadFromVault={editor.loadFromVault}
            onDeleteFromVault={editor.deleteFromVault}
            onShowMessage={editor.showMessage}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-[#3B2F2A] bg-[#161210] md:hidden"
      >
        {ALL_EDITOR_TABS.map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => editor.selectTab(tab)}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium ${
                isSelected ? 'text-[#FFD464]' : 'text-[#A59B93]'
              }`}
            >
              {getTabIcon(tab)}
              <span className="truncate max-w-full px-0.5">
                {EDITOR_TAB_META[tab].title.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Status Toast / Snackbar */}
      {statusMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-16 right-4 z-40 flex max-w-sm items-center gap-3 rounded-lg border border-[#9E7422] bg-[#2C221F] px-4 py-3 text-xs font-medium text-[#E8E0D5] shadow-lg md:bottom-6"
        >
          <span className="flex-1">{statusMessage}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={editor.clearStatusMessage}
            className="text-[#A59B93] hover:text-[#E8E0D5]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
