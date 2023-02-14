# transform
```bash
yarn transform xx.SQL ./test.d.ts
```

sql(xx.SQL):
```
CREATE TABLE `AHAHAH` (
    `id` int(11) NOT NULL AUTO_INCREMENT '身份id',
    `emodd` varchar(11) DEFAULT NULL COMMENT '数显',
    PRIMARY KEY (`ID`)
);
```

transform(test.d.ts):
```typescript
/**
 *@description xxxx
 *@property id -身份id
 *@property emodd -数显
 */
type AHAHAH = {
	id: number;
	emodd: string;
};
```
