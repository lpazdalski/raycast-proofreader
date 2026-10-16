const FINAL_PERIOD = /\.(?=["'”’)\]]*$)/;

export function dropAddedFinalPeriod(original: string, fixed: string): string {
  return FINAL_PERIOD.test(original) ? fixed : fixed.replace(FINAL_PERIOD, "");
}
