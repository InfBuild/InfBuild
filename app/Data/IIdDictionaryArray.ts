interface IIdDictionaryArray<T> extends Array<T>
{
	byKey(key: string): T;
	byId(id: number): T;
}

export default IIdDictionaryArray;
