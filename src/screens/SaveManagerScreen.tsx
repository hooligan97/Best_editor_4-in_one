import React, { useRef, useState } from 'react';
import {
  Copy,
  Cpu,
  Download,
  FileCode2,
  FolderOpen,
  HardDrive,
  PlusSquare,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  GAME_MOD_META,
  GameMod,
  HERO_CLASS_META,
  HeroCharacter,
} from '../data/models';
import { MpqHeaderInfo } from '../data/parsers/mpqTool';
import { SavedVaultHero } from '../hooks/useCharacterEditor';
import { GothicCard } from '../components/GothicCard';

interface SaveManagerScreenProps {
  hero: HeroCharacter;
  mpqInfo: MpqHeaderInfo | null;
  hexDump: string | null;
  vault: SavedVaultHero[];
  onSetIsMultiplayer: (isMp: boolean) => void;
  onSetMultiplayerSlot: (slot: number) => void;
  onSetGameMod: (mod: GameMod) => void;
  onImportSaveBytes: (bytes: Uint8Array, filename: string) => boolean;
  onExportSaveMpqBytes: (overrideHero?: Partial<HeroCharacter>) => Uint8Array;
  onImportNoctonicJson: (jsonStr: string) => boolean;
  onGetNoctonicJson: () => string;
  onInspectBytes: (bytes: Uint8Array) => void;
  onSaveToVault: (label: string) => void;
  onLoadFromVault: (item: SavedVaultHero) => void;
  onDeleteFromVault: (id: string) => void;
  onShowMessage: (msg: string) => void;
}

function downloadBinaryFile(bytes: Uint8Array, filename: string): void {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const blob = new Blob([copy], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadTextFile(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const SaveManagerScreen: React.FC<SaveManagerScreenProps> = ({
  hero,
  mpqInfo,
  hexDump,
  vault,
  onSetIsMultiplayer,
  onSetMultiplayerSlot,
  onSetGameMod,
  onImportSaveBytes,
  onExportSaveMpqBytes,
  onImportNoctonicJson,
  onGetNoctonicJson,
  onInspectBytes,
  onSaveToVault,
  onLoadFromVault,
  onDeleteFromVault,
  onShowMessage,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  const [jsonInputText, setJsonInputText] = useState('');
  const [showSnapshotDialog, setShowSnapshotDialog] = useState(false);
  const [snapshotLabel, setSnapshotLabel] = useState('');

  const modMeta = GAME_MOD_META[hero.gameMod];
  const prefix = hero.isMultiplayer ? 'multi' : 'single';
  const defaultSaveFilename = `${prefix}_${hero.multiplayerSlot}.${modMeta.defaultSaveExtension}`;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const headText = new TextDecoder().decode(bytes.slice(0, 16)).trim();
      if (
        file.name.toLowerCase().endsWith('.json') ||
        headText.startsWith('{')
      ) {
        const text = new TextDecoder().decode(bytes);
        onImportNoctonicJson(text);
      } else {
        onImportSaveBytes(bytes, file.name);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      onShowMessage(`Failed to open file: ${msg}`);
    } finally {
      e.target.value = '';
    }
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(onGetNoctonicJson());
      onShowMessage(
        'Copied Noctonic JSON to clipboard (compatible with noctonic.github.io/diablo)!'
      );
    } catch {
      onShowMessage('Clipboard access blocked — use Export JSON instead.');
    }
  };

  return (
    <div className="space-y-5">
      <input
        ref={fileInputRef}
        type="file"
        accept=".sv,.hsv,.json,*/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* DevilutionX Save Paths Guide */}
        <GothicCard borderColor="#751212">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-[#EE3535]" />
            <h1 className="font-display text-base font-bold text-[#EE3535]">
              DevilutionX Save File Paths (Android &amp; PC)
            </h1>
          </div>
          <div className="mt-3 space-y-2 text-xs leading-relaxed text-[#A59B93]">
            <p className="font-mono-tabular rounded-md border border-[#3B2F2A] bg-[#0C0908] px-3 py-2 text-[#E8E0D5]">
              /Android/data/org.diasurgical.devilutionx/files/
            </p>
            <ul className="list-disc space-y-1 pl-4">
              <li>
                Single Player Diablo 1:{' '}
                <code className="font-mono-tabular text-[#E8E0D5]">
                  single_0.sv .. single_3.sv
                </code>
              </li>
              <li>
                Multiplayer Diablo 1:{' '}
                <code className="font-mono-tabular text-[#E8E0D5]">
                  multi_0.sv .. multi_3.sv
                </code>{' '}
                (or d1_0.sv)
              </li>
              <li>
                Hellfire Single Player:{' '}
                <code className="font-mono-tabular text-[#E8E0D5]">
                  single_0.hsv .. single_3.hsv
                </code>
              </li>
              <li>
                Hellfire Multiplayer:{' '}
                <code className="font-mono-tabular text-[#E8E0D5]">
                  multi_0.hsv .. multi_3.hsv
                </code>{' '}
                (or hf_0.sv)
              </li>
              <li>
                VKDMod / Middle Earth Mod use DevilutionX-compatible{' '}
                <code className="font-mono-tabular text-[#E8E0D5]">.sv</code>{' '}
                archives.
              </li>
            </ul>
          </div>
        </GothicCard>

        {/* Save Format & Slot Switcher */}
        <GothicCard borderColor={hero.isMultiplayer ? '#EE3535' : '#9E7422'}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-bold text-[#E5B044]">
                Character Save Format
              </h2>
              <p
                className={`mt-0.5 text-xs font-semibold ${
                  hero.isMultiplayer ? 'text-[#EE3535]' : 'text-[#E8E0D5]'
                }`}
              >
                {hero.isMultiplayer
                  ? 'MULTIPLAYER Mode'
                  : 'SINGLE PLAYER Mode'}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={hero.isMultiplayer}
              onClick={() => onSetIsMultiplayer(!hero.isMultiplayer)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors ${
                hero.isMultiplayer
                  ? 'border-[#EE3535] bg-[#751212]'
                  : 'border-[#3B2F2A] bg-[#2C221F]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full transition-transform ${
                  hero.isMultiplayer
                    ? 'translate-x-6 bg-[#EE3535]'
                    : 'translate-x-1 bg-[#A59B93]'
                }`}
              />
            </button>
          </div>

          <div className="mt-4">
            <span className="text-xs text-[#A59B93]">Hero Slot (0 – 3)</span>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((s) => {
                const selected = hero.multiplayerSlot === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onSetMultiplayerSlot(s)}
                    className={`rounded-lg border px-2 py-2 font-mono-tabular text-xs font-semibold whitespace-nowrap transition-colors ${
                      selected
                        ? 'border-[#EE3535] bg-[#751212] text-white'
                        : 'border-[#3B2F2A] bg-[#2C221F] text-[#A59B93] hover:text-[#E8E0D5]'
                    }`}
                  >
                    Slot #{s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#3B2F2A] bg-[#2C221F] px-3 py-2.5">
            <Save className="h-4 w-4 shrink-0 text-[#FFD464]" />
            <span className="font-mono-tabular text-xs font-bold text-[#FFD464]">
              Default Filename: {defaultSaveFilename}
            </span>
          </div>
        </GothicCard>
      </div>

      {/* File Operations */}
      <GothicCard borderColor="#9E7422">
        <h2 className="font-display text-base font-bold text-[#E5B044]">
          Save File &amp; Noctonic JSON Operations
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#3B2F2A] bg-[#2C221F] px-4 py-2.5 text-xs font-semibold text-[#FFD464] whitespace-nowrap transition-colors hover:border-[#E5B044]"
          >
            <FolderOpen className="h-4 w-4 shrink-0" />
            <span>Open .sv / .hsv / .json File</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const bytes = onExportSaveMpqBytes();
              downloadBinaryFile(bytes, defaultSaveFilename);
              onShowMessage(
                `Exported ${defaultSaveFilename} (${hero.isMultiplayer ? 'Multiplayer' : 'Single Player'})!`
              );
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#751212] px-4 py-2.5 text-xs font-bold text-white whitespace-nowrap transition-colors hover:bg-[#C82323]"
          >
            <Download className="h-4 w-4 shrink-0" />
            <span>Save {defaultSaveFilename}</span>
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              onSetIsMultiplayer(true);
              const bytes = onExportSaveMpqBytes({ isMultiplayer: true });
              downloadBinaryFile(bytes, 'multi_0.sv');
              onShowMessage('Exported MP Diablo (multi_0.sv)');
            }}
            className="rounded-lg border border-[#751212] bg-[#161210] px-3 py-2 text-xs font-semibold text-[#EE3535] whitespace-nowrap transition-colors hover:bg-[#751212]/25"
          >
            Quick Export MP Diablo (multi_0.sv)
          </button>

          <button
            type="button"
            onClick={() => {
              onSetIsMultiplayer(true);
              onSetGameMod(GameMod.HELLFIRE);
              const bytes = onExportSaveMpqBytes({
                isMultiplayer: true,
                gameMod: GameMod.HELLFIRE,
              });
              downloadBinaryFile(bytes, 'multi_0.hsv');
              onShowMessage('Exported MP Hellfire (multi_0.hsv)');
            }}
            className="rounded-lg border border-[#751212] bg-[#161210] px-3 py-2 text-xs font-semibold text-[#EE3535] whitespace-nowrap transition-colors hover:bg-[#751212]/25"
          >
            Quick Export MP Hellfire (multi_0.hsv)
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => {
              const filename = `${(hero.name || 'hero').toLowerCase()}_hero.json`;
              downloadTextFile(onGetNoctonicJson(), filename);
              onShowMessage(`Exported ${filename}`);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#3B2F2A] bg-[#161210] px-3 py-2 text-xs font-medium text-[#E8E0D5] whitespace-nowrap transition-colors hover:border-[#9E7422]"
          >
            <FileCode2 className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handleCopyJson}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#9E7422] bg-[#161210] px-3 py-2 text-xs font-semibold text-[#FFD464] whitespace-nowrap transition-colors hover:bg-[#9E7422] hover:text-[#0C0908]"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Copy Noctonic JSON</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setJsonInputText('');
              setShowJsonDialog(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#17427C] bg-[#161210] px-3 py-2 text-xs font-semibold text-[#5AA1FF] whitespace-nowrap transition-colors hover:bg-[#17427C] hover:text-white"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Paste JSON</span>
          </button>
        </div>
      </GothicCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* MPQ Tools & Hex Inspector */}
        <GothicCard borderColor="#17427C">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[#5AA1FF]" />
              <h2 className="font-display text-base font-bold text-[#5AA1FF]">
                MPQ Archive &amp; Hex Inspector
              </h2>
            </div>

            <button
              type="button"
              onClick={() => {
                const bytes = onExportSaveMpqBytes();
                onInspectBytes(bytes);
                onShowMessage('Analyzed DevilutionX MPQ container');
              }}
              className="rounded-lg border border-[#2D7BDE] bg-[#2C221F] px-3 py-1.5 text-xs font-semibold text-[#5AA1FF] whitespace-nowrap transition-colors hover:bg-[#17427C] hover:text-white"
            >
              Inspect Current Hero
            </button>
          </div>

          {mpqInfo && (
            <div className="mt-4 rounded-lg border border-[#3B2F2A] bg-[#2C221F] p-3 text-xs space-y-1">
              <div className="font-semibold text-[#FFD464]">
                Signature: {mpqInfo.signature} ·{' '}
                {mpqInfo.isValidMpq
                  ? 'Valid MPQ Container'
                  : 'Binary Hero Struct'}
              </div>
              <div className="font-mono-tabular text-[#A59B93]">
                Archive Size: {mpqInfo.archiveSize} bytes · Header:{' '}
                {mpqInfo.headerSize} bytes · Sector: {mpqInfo.sectorSize} bytes
              </div>
              <div className="text-[#5AA1FF]">
                Internal Files:{' '}
                {mpqInfo.detectedInternalFiles.length > 0
                  ? mpqInfo.detectedInternalFiles.join(', ')
                  : 'None detected'}
              </div>
            </div>
          )}

          {hexDump ? (
            <pre className="font-mono-tabular mt-3 max-h-72 overflow-auto rounded-lg border border-[#3B2F2A] bg-[#090605] p-3 text-[11px] leading-relaxed text-[#E8E0D5]">
              {hexDump}
            </pre>
          ) : (
            <p className="mt-4 text-xs text-[#A59B93]">
              Open a .sv/.hsv file or click "Inspect Current Hero" to examine
              MPQ headers and binary hex output.
            </p>
          )}
        </GothicCard>

        {/* Backup Vault */}
        <GothicCard>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-bold text-[#E5B044]">
              Backup Vault
            </h2>
            <button
              type="button"
              onClick={() => {
                setSnapshotLabel(
                  `${hero.name} (Lv ${hero.level}${hero.isMultiplayer ? ' MP' : ''})`
                );
                setShowSnapshotDialog(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#9E7422] bg-[#2C221F] px-3 py-1.5 text-xs font-semibold text-[#FFD464] whitespace-nowrap transition-colors hover:bg-[#9E7422] hover:text-[#0C0908]"
            >
              <PlusSquare className="h-3.5 w-3.5" />
              <span>Save Snapshot</span>
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            {vault.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-[#3B2F2A] bg-[#2C221F] px-3.5 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-[#E8E0D5]">
                    {item.label}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-[#A59B93]">
                    <span>{item.character.name}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular">
                      Lv {item.character.level}{' '}
                      {HERO_CLASS_META[item.character.heroClass].displayName}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{GAME_MOD_META[item.character.gameMod].shortName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.timestamp}</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onLoadFromVault(item)}
                    className="rounded-md border border-[#3B2F2A] bg-[#161210] px-3 py-1.5 text-xs font-semibold text-[#FFD464] whitespace-nowrap transition-colors hover:border-[#E5B044]"
                  >
                    Load
                  </button>
                  {!item.isPreset && (
                    <button
                      type="button"
                      aria-label={`Delete ${item.label}`}
                      onClick={() => onDeleteFromVault(item.id)}
                      className="rounded-md p-1.5 text-[#EE3535] hover:bg-[#751212]/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GothicCard>
      </div>

      {/* Paste Noctonic JSON Dialog */}
      {showJsonDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowJsonDialog(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-[#3B2F2A] bg-[#161210] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-[#E5B044]">
                Paste Noctonic DEADitor JSON
              </h3>
              <button
                type="button"
                onClick={() => setShowJsonDialog(false)}
                className="rounded p-1 text-[#A59B93] hover:text-[#E8E0D5]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1.5 text-xs text-[#A59B93]">
              Paste JSON exported from noctonic.github.io/diablo or this editor:
            </p>
            <textarea
              value={jsonInputText}
              onChange={(e) => setJsonInputText(e.target.value)}
              rows={9}
              placeholder='{"name": "...", "class": "..."}'
              className="font-mono-tabular mt-3 w-full rounded-lg border border-[#3B2F2A] bg-[#0C0908] p-3 text-xs text-[#E8E0D5] placeholder-[#A59B93]/50 focus:border-[#E5B044] focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowJsonDialog(false)}
                className="rounded-lg border border-[#3B2F2A] px-4 py-2 text-xs font-medium text-[#A59B93] hover:text-[#E8E0D5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onImportNoctonicJson(jsonInputText)) {
                    setShowJsonDialog(false);
                  }
                }}
                className="rounded-lg bg-[#9E7422] px-4 py-2 text-xs font-bold text-[#FFD464] hover:bg-[#E5B044] hover:text-[#0C0908]"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Snapshot Dialog */}
      {showSnapshotDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowSnapshotDialog(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-[#3B2F2A] bg-[#161210] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-[#E5B044]">
                Save Vault Snapshot
              </h3>
              <button
                type="button"
                onClick={() => setShowSnapshotDialog(false)}
                className="rounded p-1 text-[#A59B93] hover:text-[#E8E0D5]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1.5 text-xs text-[#A59B93]">
              Enter a label for this local character backup:
            </p>
            <input
              type="text"
              value={snapshotLabel}
              onChange={(e) => setSnapshotLabel(e.target.value)}
              className="mt-3 w-full rounded-lg border border-[#3B2F2A] bg-[#0C0908] px-3.5 py-2.5 text-sm text-[#E8E0D5] focus:border-[#E5B044] focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSnapshotDialog(false)}
                className="rounded-lg border border-[#3B2F2A] px-4 py-2 text-xs font-medium text-[#A59B93] hover:text-[#E8E0D5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onSaveToVault(snapshotLabel);
                  setShowSnapshotDialog(false);
                }}
                className="rounded-lg bg-[#9E7422] px-4 py-2 text-xs font-bold text-[#FFD464] hover:bg-[#E5B044] hover:text-[#0C0908]"
              >
                Save Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
