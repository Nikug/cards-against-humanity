import { DEFAULT_VOLUMES } from '../../consts/volumes';

export const radioVolumeAdjuster = (volume = DEFAULT_VOLUMES.RADIO) => {
    return volume / 200;
};

export const textToSpeechVolumeAdjuster = (volume = DEFAULT_VOLUMES.TEXTTOSPEECH) => {
    return volume / 100;
};
