
declare module 'ml-levenberg-marquardt-m93a/src'
{
    import LM from 'ml-levenberg-marquardt';

    namespace LM2 {
        export interface Data extends LM.Data
        {
            xError?: number[],
            yError?: number[]
        }

        export type FittedFunction = LM.FittedFunction;

        export interface Options extends LM.Options
        {
            maxValues: number[];
            minValues: number[];
            errorPropagation: {
                rough?: number,
                fine?: number
            };
        }

        export interface Result extends LM.Result
        {
            residuals: number;
        }
    }

    function LM2(d: LM2.Data, fn: LM2.FittedFunction, o?: Partial<LM2.Options>): LM2.Result;

    export default LM2;
}