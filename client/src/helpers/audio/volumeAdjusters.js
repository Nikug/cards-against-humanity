import { VOLUMES } from '../../consts/volumes';

export const radioVolumeAdjuster = (volume = VOLUMES.RADIO) => {
    return volume / 200;
};

export const textToSpeechVolumeAdjuster = (volume = VOLUMES.TEXTTOSPEECH) => {
    return volume / 100;
};
