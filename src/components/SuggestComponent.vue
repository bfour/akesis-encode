<template>
  <div class="q-gutter-xl container">
    <div>
      <div class="label text-center">
        Please describe your symptom observation or medical history.
      </div>
      <q-form @submit="onSubmit" class="form q-gutter-md">
        <q-input
          outlined
          v-model="text"
          autogrow
          class="userInput"
          @keydown.enter.prevent="onSubmit"
          :disable="isLoading"
        />
        <q-btn label="Codify" type="submit" rounded :loading="isLoading" />
      </q-form>
    </div>

    <q-card v-show="codifiedText.length > 0">
      <q-expansion-item expand-separator label="Codified Text">
        <q-card-section>
          <pre id="my-content">{{ codifiedText }}</pre>
        </q-card-section>
      </q-expansion-item>
      <q-expansion-item
        expand-separator
        :label="`Detected Entities (${detectedEnties.length})`"
      >
        <q-card-section>
          <q-list>
            <q-item v-for="entity in detectedEnties" :key="entity">
              <q-item-section>
                <q-item-label>{{ entity }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-expansion-item>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { Recogito } from '@recogito/recogito-js';
import '@recogito/recogito-js/dist/recogito.min.css';
import AWS, { ComprehendMedical } from 'aws-sdk';
import { useQuasar } from 'quasar';
import { onMounted, ref } from 'vue';

const quasar = useQuasar();

var config = new AWS.Config({
  accessKeyId: process.env.AWS_KEY ?? '',
  secretAccessKey: process.env.AWS_SECRET ?? '',
  region: process.env.AWS_REGION ?? '',
});
const comprehendMedical = new AWS.ComprehendMedical(config);

const text = ref<string>('');
const codifiedText = ref<string>('');
const detectedEnties = ref<Array<string>>([]);
const isLoading = ref<boolean>(false);

/* eslint-disable  @typescript-eslint/no-explicit-any */
let r: null | any = null;
onMounted(() => {
  r = new Recogito({
    content: 'my-content',
    locale: 'auto',
    allowEmpty: true,
    widgets: [
      { widget: 'COMMENT' },
      {
        widget: 'TAG',
        vocabulary: ['Place', 'Person', 'Event', 'Organization', 'Animal'],
      },
    ],
    relationVocabulary: ['isRelated', 'isPartOf', 'isSameAs '],
  });
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  r.on('createAnnotation', (annotation: any) => {
    console.log('Annotation created:', annotation);
  });
  // r.setMode('RELATIONS');
});

const onSubmit = async () => {
  try {
    isLoading.value = true;

    // r.loadAnnotations('annotations.w3c.json').then(() => console.log('loaded'));

    // r.addAnnotation({
    //   type: 'Annotation',
    //   body: [
    //     {
    //       type: 'TextualBody',
    //       value: 'wte',
    //       purpose: 'commenting',
    //     },
    //   ],
    //   target: {
    //     selector: [
    //       {
    //         type: 'TextQuoteSelector',
    //         exact: 'home',
    //       },
    //       {
    //         type: 'TextPositionSelector',
    //         start: 1,
    //         end: 3,
    //       },
    //     ],
    //   },
    //   '@context': 'http://www.w3.org/ns/anno.jsonld',
    //   id: '#xxxxxxxxce0ed291-766b-4763-8e91-90ce1d04e706',
    // });

    // r.addAnnotation({
    //   type: 'Annotation',
    //   body: [
    //     {
    //       type: 'TextualBody',
    //       value: 'wte',
    //       purpose: 'commenting',
    //     },
    //   ],
    //   target: {
    //     selector: [
    //       {
    //         type: 'TextQuoteSelector',
    //         exact: 'home',
    //       },
    //       {
    //         type: 'TextPositionSelector',
    //         start: 6,
    //         end: 14,
    //       },
    //     ],
    //   },
    //   '@context': 'http://www.w3.org/ns/anno.jsonld',
    //   id: '#447d4bea-08dc-4bd0-ae51-31f5ed7a95a0',
    // });

    // r.setMode('RELATIONS');
    // r.addAnnotation({
    //   '@context': 'http://www.w3.org/ns/anno.jsonld',
    //   type: 'Annotation',
    //   id: '#4de98f32-2b1b-4214-b1ed-3c2aefed43bb',
    //   body: [
    //     {
    //       type: 'TextualBody',
    //       value: 'test',
    //       purpose: 'tagging',
    //     },
    //   ],
    //   target: [
    //     {
    //       id: '#447d4bea-08dc-4bd0-ae51-31f5ed7a95a0',
    //     },
    //     {
    //       id: '#ce0ed291-766b-4763-8e91-90ce1d04e706',
    //     },
    //   ],
    //   motivation: 'linking',
    // });

    codifiedText.value = text.value;
    detectedEnties.value = [];

    const params = {
      Text: text.value,
    };

    comprehendMedical.inferSNOMEDCT(params, (error, data) => {
      if (error) {
        console.error(error);
        onError(error);
      } else {
        console.log(data);
        awsMedicalSnomedResponseToStringList(data).forEach((entity) => {
          detectedEnties.value.push(entity);
        });
        awsMedicalSnomedResponseToAnnotations(data).forEach((annotation) => {
          r.addAnnotation(annotation);
        });
      }
    });
  } catch (error) {
    console.error(error);
    onError(error);
  } finally {
    isLoading.value = false;
  }
};

const awsMedicalSnomedResponseToAnnotations = (
  response: ComprehendMedical.Types.InferSNOMEDCTResponse
) => {
  return (
    response.Entities?.map((entity) => {
      const snomedString = entity.Attributes
        ? entity.SNOMEDCTConcepts?.map(
            (concept) => `${concept.Description} (${concept.Code})`
          ).join('; ')
        : '';
      return {
        type: 'Annotation',
        body: [
          {
            type: 'TextualBody',
            value: snomedString,
            purpose: 'commenting',
          },
        ],
        target: {
          selector: [
            {
              type: 'TextQuoteSelector',
              exact: entity.Text,
            },
            {
              type: 'TextPositionSelector',
              start: entity.BeginOffset,
              end: entity.EndOffset,
            },
          ],
        },
        '@context': 'http://www.w3.org/ns/anno.jsonld',
        id: `#${entity.Id}`,
      };
    }) ?? []
  );
};

const awsMedicalSnomedResponseToStringList = (
  response: ComprehendMedical.Types.InferSNOMEDCTResponse
) => {
  return (
    response.Entities?.map((entity) => {
      const snomedString = entity.Attributes
        ? entity.SNOMEDCTConcepts?.map(
            (concept) => `${concept.Description} (${concept.Code})`
          ).join('; ')
        : '';
      return `${entity.Text} (${entity.Category}) (${snomedString})`;
    }) ?? []
  );
};

const onError = (error: any) => {
  quasar.notify({
    message: 'An error occurred',
    caption: `${error}`,
    type: 'negative',
    multiLine: true,
    progress: true,
    actions: [
      {
        label: 'Contact support',
        color: 'white',
        handler: () => {
          window.location.href = 'mailto:bfourdev@gmail.com';
        },
      },
    ],
  });
};
</script>

<style lang="scss">
.container {
  padding: 12px;
}

.form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 1.1em;
  margin-bottom: 10px;
}

.userInput {
  align-self: stretch;
  textarea {
    max-width: 500px;
  }
}

.suggestionHeading {
  max-width: 400px;
}

.suggestionList {
  .q-item {
    border-radius: 22px;
  }
}
</style>
