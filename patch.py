import re
path = "app/src/main/java/com/example/ui/CharacterViewModel.kt"
with open(path, "r") as f:
    code = f.read()
new_code = """
    fun importSaveBytes(bytes: ByteArray, filename: String): Boolean {
        var stagedArchive: File? = null
        return try {
            val extension = if (filename.endsWith(".hsv", ignoreCase = true)) "hsv" else "sv"
            stagedArchive = File.createTempFile("d1-native-import-", ".$extension")
            stagedArchive.writeBytes(bytes)
            val isMultiplayer = filename.startsWith("multi_", ignoreCase = true)
            val isHellfire = extension == "hsv"
            val rawHero = NativeSaveBridge.readHero(stagedArchive.absolutePath, isMultiplayer, false, isHellfire, isHellfire)
            if (rawHero != null && rawHero.isNotEmpty()) {
                importedOriginalSave = bytes.copyOf()
                importedRawHero = rawHero.copyOf()
                val parsedHero = parseNativePlayerPack(rawHero)
                _character.value = parsedHero
                true
            } else { false }
        } catch (e: Exception) { Log.e("D1", "Err: ${e.message}"); false
        } finally { stagedArchive?.delete() }
    }
    private fun parseNativePlayerPack(raw: ByteArray): HeroCharacter {
        val buffer = ByteBuffer.wrap(raw).order(ByteOrder.LITTLE_ENDIAN)
        val nameBytes = ByteArray(32); buffer.get(nameBytes, 0, 32)
        val parsedName = String(nameBytes).substringBefore('\\u0000').trim()
        val classIndex = buffer.get().toInt() and 0xFF
        val baseStr = buffer.get().toInt() and 0xFF
        val baseMag = buffer.get().toInt() and 0xFF
        val baseDex = buffer.get().toInt() and 0xFF
        val baseVit = buffer.get().toInt() and 0xFF
        val level = buffer.get().toInt() and 0xFF
        buffer.get() // statPoints
        val experience = buffer.getInt().toLong() and 0xFFFFFFFFL
        val gold = buffer.getInt().toLong().coerceAtLeast(0)
        val hp = (buffer.getInt() / 64).coerceAtLeast(1)
        val maxHp = (buffer.getInt() / 64).coerceAtLeast(1)
        val mana = (buffer.getInt() / 64).coerceAtLeast(0)
        val maxMana = (buffer.getInt() / 64).coerceAtLeast(0)
        return _character.value.copy(
            name = if (parsedName.isBlank()) "Bezimienny" else parsedName,
            heroClass = try { HeroClass.fromIndex(classIndex) } catch (e: Exception) { HeroClass.WARRIOR },
            level = level, experience = experience, gold = gold,
            baseStrength = baseStr, strength = baseStr, baseMagic = baseMag, magic = baseMag,
            baseDexterity = baseDex, dexterity = baseDex, baseVitality = baseVit, vitality = baseVit,
            life = hp, maxLife = maxHp, baseLife = maxHp, mana = mana, maxMana = maxMana, baseMana = maxMana
        )
    }
"""
start = code.find("fun importSaveBytes")
if start != -1:
    next_fun = code.find("fun ", start + 10)
    if next_fun == -1: end = code.rfind("}")
    else: end = next_fun
    code = code[:start] + new_code + "\n    " + code[end:]
    with open(path, "w") as f: f.write(code)
