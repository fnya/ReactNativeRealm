import React, {useEffect} from 'react';
import {SafeAreaView, Text} from 'react-native';
import Realm from 'realm';
import DeviceInfo from 'react-native-device-info';
import 'react-native-get-random-values';
import {v4 as uuid} from 'uuid';

// Schema definition
const PersonSchema = {
  name: 'Person',
  properties: {
    name: 'string', // required
    age: 'int?', // optional
  },
};

const BookSchema = {
  name: 'Book',
  primaryKey: 'id',
  properties: {
    id: 'string', // primary key
    title: {type: 'string', indexed: true}, // index
    price: 'int',
  },
};

const App = () => {
  useEffect(() => {
    const printSystemName = () => {
      // OS 名を出力する
      const systemName = DeviceInfo.getSystemName();
      console.log(systemName);
    };

    const simpleSample = async () => {
      printSystemName();
      console.log('Start SimpleSample');

      let realm: Realm;

      try {
        realm = await Realm.open({
          schema: [{name: 'Dog', properties: {name: 'string'}}],
        });

        realm.write(() => {
          realm.create('Dog', {name: 'Rex'});
        });

        // Dog テーブルのデータ件数を取得する
        const info = realm
          ? 'Number of dogs in this Realm: ' + realm.objects('Dog').length
          : 'Nothing...';

        console.log(info);

        // Realm データベースのパスを出力する
        console.log(realm.path);
      } catch (error) {
        console.log(error);
      } finally {
        // Realm データベースは使用後必ずクローズする
        // @ts-ignore
        if (realm !== undefined && !realm.isClosed) {
          realm.close();
        }
      }
    };

    const addData = async () => {
      printSystemName();
      console.log('Start addData');

      let realm: Realm;

      try {
        realm = await Realm.open({
          schema: [PersonSchema],
        });

        realm.write(() => {
          realm.create('Person', {name: '山田太郎', age: 23});
        });

        // Person テーブルのデータ件数を取得する
        const info = realm
          ? 'Number of person in this Realm: ' + realm.objects('Person').length
          : 'Nothing...';

        console.log(info);
      } catch (error) {
        console.log(error);
      } finally {
        // Realm データベースは使用後必ずクローズする
        // @ts-ignore
        if (realm !== undefined && !realm.isClosed) {
          realm.close();
        }
      }
    };

    const searchData = async () => {
      printSystemName();
      console.log('Start searchData');

      let realm: Realm;

      try {
        realm = await Realm.open({
          schema: [PersonSchema],
        });

        realm.write(() => {
          realm.deleteAll(); // 全件削除
          realm.create('Person', {name: '山田太郎', age: 23});
          realm.create('Person', {name: '佐藤花子', age: 18});
          realm.create('Person', {name: '田中哲朗', age: 33});
        });

        // Person テーブルを検索する
        const people = realm.objects('Person').filtered('age > 20');

        people.forEach(person => {
          // @ts-ignore
          console.log(`name=${person.name}, age=${person.age}`);
        });
      } catch (error) {
        console.log(error);
      } finally {
        // Realm データベースは使用後必ずクローズする
        // @ts-ignore
        if (realm !== undefined && !realm.isClosed) {
          realm.close();
        }
      }
    };

    const updateData = async () => {
      printSystemName();
      console.log('Start updateData');

      let realm: Realm;

      try {
        realm = await Realm.open({
          schema: [PersonSchema],
        });

        realm.write(() => {
          realm.deleteAll(); // 全件削除
          realm.create('Person', {name: '山田太郎', age: 23});
          realm.create('Person', {name: '佐藤花子', age: 18});
          realm.create('Person', {name: '田中哲朗', age: 33});
        });

        // Person テーブルを検索する
        const person = realm
          .objects('Person')
          .filtered('name CONTAINS "山田"')[0];

        // 更新はプロパティをセットするだけ
        realm.write(() => {
          // @ts-ignore
          person.age = 10;
        });

        // Person テーブルを再検索する（全件取得）
        const people = realm.objects('Person');

        people.forEach(p => {
          // @ts-ignore
          console.log(`name=${p.name}, age=${p.age}`);
        });
      } catch (error) {
        console.log(error);
      } finally {
        // Realm データベースは使用後必ずクローズする
        // @ts-ignore
        if (realm !== undefined && !realm.isClosed) {
          realm.close();
        }
      }
    };

    const deleteData = async () => {
      printSystemName();
      console.log('Start deleteData');

      let realm: Realm;

      try {
        realm = await Realm.open({
          schema: [PersonSchema],
        });

        realm.write(() => {
          realm.deleteAll(); // 全件削除
          realm.create('Person', {name: '山田太郎', age: 23});
          realm.create('Person', {name: '佐藤花子', age: 18});
          realm.create('Person', {name: '田中哲朗', age: 33});
        });

        // Person テーブルを検索する
        const person = realm
          .objects('Person')
          .filtered('name CONTAINS "山田"')[0];

        // 削除処理
        realm.write(() => {
          realm.delete(person);
        });

        // Person テーブルを再検索する（全件取得）
        const people = realm.objects('Person');

        people.forEach(p => {
          // @ts-ignore
          console.log(`name=${p.name}, age=${p.age}`);
        });
      } catch (error) {
        console.log(error);
      } finally {
        // Realm データベースは使用後必ずクローズする
        // @ts-ignore
        if (realm !== undefined && !realm.isClosed) {
          realm.close();
        }
      }
    };

    const useTransaction = async (isException: boolean) => {
      printSystemName();
      console.log('Start useTransaction');

      let realm: Realm;

      try {
        realm = await Realm.open({
          schema: [PersonSchema],
        });

        realm.write(() => {
          realm.deleteAll(); // 全件削除
        });

        try {
          // Start transaction
          realm.beginTransaction();

          realm.create('Person', {name: '山田太郎', age: 23});
          realm.create('Person', {name: '佐藤花子', age: 18});
          realm.create('Person', {name: '田中哲朗', age: 33});

          if (isException) {
            throw new Error('transaction failed.');
          }

          // commit
          realm.commitTransaction();
        } catch (error) {
          console.log(error);

          // rollback
          realm.cancelTransaction();
        }

        // Person テーブルを再検索する（全件取得）
        const people = realm.objects('Person');

        console.log(`count = ${people.length}`);

        people.forEach(p => {
          // @ts-ignore
          console.log(`name=${p.name}, age=${p.age}`);
        });
      } catch (error) {
        console.log(error);
      } finally {
        // Realm データベースは使用後必ずクローズする
        // @ts-ignore
        if (realm !== undefined && !realm.isClosed) {
          realm.close();
        }
      }
    };

    const usePrimaryKeyAndIndex = async () => {
      printSystemName();
      console.log('Start usePrimaryKeyAndIndex');

      let realm: Realm;

      try {
        realm = await Realm.open({
          schema: [BookSchema],
        });

        realm.write(() => {
          realm.deleteAll(); // 全件削除
          realm.create('Book', {
            id: uuid(),
            title: 'ドメイン駆動設計',
            price: 3000,
          });
          realm.create('Book', {
            id: uuid(),
            title: 'React Native 入門',
            price: 2000,
          });
          realm.create('Book', {
            id: uuid(),
            title: 'Kotlin 入門',
            price: 1000,
          });
        });

        // Book テーブルを検索する
        const books = realm.objects('Book').filtered('price > 1000');

        books.forEach(book => {
          console.log(
            // @ts-ignore
            `id=${book.id}, title=${book.title}, price=${book.price}`,
          );
        });
      } catch (error) {
        console.log(error);
      } finally {
        // Realm データベースは使用後必ずクローズする
        // @ts-ignore
        if (realm !== undefined && !realm.isClosed) {
          realm.close();
        }
      }
    };

    // 実行したいサンプルをコメントアウトしてください
    // simpleSample();
    // addData();
    // searchData();
    // updateData();
    // deleteData();
    // useTransaction(false); // commit
    // useTransaction(true); // rollback
    // usePrimaryKeyAndIndex();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <SafeAreaView>
        <Text>Hello</Text>
      </SafeAreaView>
    </>
  );
};

export default App;
