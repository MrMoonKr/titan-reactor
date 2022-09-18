
import { AudioListener, Vector3, Audio } from "three";
import { SoundDAT } from "common/types";
import range from "common/utils/range";
import { SoundChannel } from "./sound-channel";
import { MainMixer } from "./main-mixer";

// an implementation of bw sound referenced from openbw, limited to 8 channels (although not really since tails are allowed to continue)
export class SoundChannels {
  maxChannels = 8;
  channels: SoundChannel[];
  buffers: Map<number, AudioBuffer> = new Map();
  #loading: Map<number, boolean> = new Map();
  #mixerRef: WeakRef<MainMixer>;

  constructor(
    mixer: MainMixer,
  ) {
    this.#mixerRef = new WeakRef(mixer);
    this.channels = range(0, this.maxChannels).map(() => new SoundChannel(mixer));
  }

  get #mixer() {
    return this.#mixerRef.deref()!;
  }

  async _load(typeId: number) {
    this.#loading.set(typeId, true);
    const result = await this.#mixer.loadAudioBuffer(typeId);
    this.#loading.delete(typeId);
    return result
  }

  _getAvailableChannel(dat: SoundDAT, typeId: number, unitTypeId: number) {
    if (dat.flags & 0x10) {
      for (const channel of this.channels) {
        if ((channel.isQueued || channel.isPlaying) && channel.typeId === typeId) {
          return;
        }
      }
    } else if (dat.flags & 2 && unitTypeId >= 0) {
      for (const channel of this.channels) {
        if (
          (channel.isQueued || channel.isPlaying) &&
          channel.unitTypeId === unitTypeId &&
          channel.flags & 2
        ) {
          return;
        }
      }
    }

    let availableChannel;
    for (const channel of this.channels) {
      if (!(channel.isQueued || channel.isPlaying)) {
        availableChannel = channel;
      }
    }

    if (availableChannel) {
      return availableChannel;
    }

    let bestPriority = dat.priority;
    for (const channel of this.channels) {
      if (channel.isQueued) continue;
      if (channel.flags & 0x20) continue;
      if (channel.priority < bestPriority) {
        bestPriority = channel.priority;
        availableChannel = channel;
      }
    }
    return availableChannel;
  }

  async playGlobal(typeId: number, volume?: number) {
    if (typeId === 0 || this.#loading.get(typeId)) {
      return;
    }
    const buffer = this.buffers.get(typeId) ?? await this._load(typeId);
    const audio = new Audio(this.#mixer as unknown as AudioListener);

    audio.setVolume(volume ?? this.#mixer.soundVolume)
    audio.setBuffer(buffer);
    audio.play();
  }

  play(elapsed: number, typeId: number, unitTypeId: number, dat: SoundDAT, mapCoords: Vector3, volume: number | null, pan: number | null) {


    const buffer = this.buffers.get(typeId);

    if (buffer) {
      const channel = this._getAvailableChannel(dat, typeId, unitTypeId);
      if (!channel || elapsed - channel.lastPlayed <= 80) {
        return;
      }
      channel.queue(typeId, unitTypeId, mapCoords, dat.flags, dat.priority, volume, pan);
      channel.play(elapsed, buffer);

    } else {
      if (this.#loading.get(typeId)) {
        return;
      }

      const channel = this._getAvailableChannel(dat, typeId, unitTypeId);
      if (!channel) {
        return;
      }

      channel.queue(typeId, unitTypeId, mapCoords, dat.flags, dat.priority, volume, pan);

      this._load(typeId).then(buffer => {
        channel.play(elapsed, buffer);
        this.buffers.set(typeId, buffer);
      })
    }
  }
}