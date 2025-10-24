export interface WeatherValue {
  time: string;
  value: number;
}

export interface WeatherData {
  temperature: {
    unit: string;
    values: WeatherValue[];
  };
  power: {
    unit: string;
    values: WeatherValue[];
  };
}
