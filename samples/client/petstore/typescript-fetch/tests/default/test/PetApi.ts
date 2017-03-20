import {expect} from 'chai';
import {PetApi, Pet, Category} from 'typescript-fetch-api';

describe('PetApi', () => {

  function runSuite(description: string, requestOptions?: any): void {

    describe(description, () => {

      let api: PetApi;
      const fixture: Pet = createTestFixture();

      const parameterInspector = (...args: any[]) => {
        return Promise.resolve({
          status: 200,
          arguments: args
        });
      };

      beforeEach(() => {
        api = new PetApi();
      });

      it('should add and delete Pet', () => {
        return api.addPet({ body: fixture }, requestOptions).then(() => {
        });
      });

      it('should get Pet by ID', () => {
          return api.getPetById({ petId: fixture.id }, requestOptions).then((result) => {
              return expect(result).to.deep.equal(fixture);
          });
      });

      it('should update Pet by ID', () => {
        return api.getPetById({ petId: fixture.id }, requestOptions).then( (result) => {
          result.name = 'newname';
          return api.updatePet({ body: result }, requestOptions).then(() => {
            return api.getPetById({ petId: fixture.id }, requestOptions).then( (result) => {
              return expect(result.name).to.deep.equal('newname');
            });
          });
        });
      });

      it('should update Pet using url-encoded form', () => {
        return new PetApi(parameterInspector).updatePetWithForm({ petId: fixture.id.toString(), name: "Snoopy" }).then(({arguments: [url, init]}) => {
          return expect(init.headers['Content-Type']).to.equal('application/x-www-form-urlencoded');
        });
      });

      it('should not set a content-type header when uploading a file', () => {
        return new PetApi(parameterInspector).uploadFile({ petId: fixture.id, file: new File(['snoopy'], 'Snoopy.png')}).then(({arguments: [url, init]}) => {
          return expect(init.headers['Content-Type']).to.be.undefined;
        });
      });

      it('should delete Pet', () => {
        return api.deletePet({ petId: fixture.id }, requestOptions);
      });

      it('should not contain deleted Pet', () => {
          return api.getPetById({ petId: fixture.id }, requestOptions).then((result) => {
              return expect(result).to.not.exist;
          }, (err) => {
            return expect(err).to.exist;
          });
      });

    });
  }

  runSuite('without custom request options');

  runSuite('with custom request options', {
    credentials: 'include',
    mode: 'cors'
  });

});

function createTestFixture(ts = Date.now()) {
  const category: Category = {
    'id': ts,
    'name': `category${ts}`,
  };

  const pet: Pet = {
    'id': ts,
    'name': `pet${ts}`,
    'category': category,
    'photoUrls': ['http://foo.bar.com/1', 'http://foo.bar.com/2'],
    'status': 'available',
    'tags': []
  };

  return pet;
};
