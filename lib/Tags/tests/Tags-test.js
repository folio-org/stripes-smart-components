import React from 'react';
import { beforeEach, afterEach, describe, it } from 'mocha';
import {
  MultiSelect,
  MultiSelectMenu,
  Accordion,
  List,
  HTML,
  runAxeTest,
  MultiSelectOption,
  including,
  TextInput,
  Callout,
} from '@folio/stripes-testing';
import { stripesConnect } from '@folio/stripes-core';
import { setupApplication } from '../../../tests/helpers';
import Tags, { TagsAccordion, withTags } from '..';
import TagsWrapped from './TagsWrapped';

const ConnectedTags = stripesConnect(Tags);
const ConnectedTagsAccordion = stripesConnect(TagsAccordion);
const ConnectedWithTags = stripesConnect(withTags(TagsWrapped));

const AriaLabelledMultiSelect = MultiSelect.extend('aria-html')
  .filters({
    ariaLabel: el => el.getElementsByTagName('label')[0].innerText || '',
  });

describe('Tags smart component', () => {
  describe('Tags helper app', () => {
    setupApplication({
      component: (
        <ConnectedTags
          link="dummy/entity"
        />
      ),
    });

    beforeEach(async function () {
      await this.server.createList('tag', 10);
    });

    it('renders', () => MultiSelect().exists());

    describe('tag list rendered as options', () => {
      beforeEach(async () => {
        await MultiSelect().toggle();
      });

      it('renders tags as options', () => MultiSelectMenu().has({ optionCount: 10 }));
    });

    describe('adding a new tag', () => {
      beforeEach(async () => {
        await MultiSelect().filter('tag-test');
        await MultiSelectOption(including('Add tag for')).click();
      });

      it('callout on success', () => Callout({ type: 'success' }).exists());

      // when entity._version increments we re-enable the form and put focus back on input
      // for some reason mirage doesn't call initial GET request on entities so resources.entities.records is empty
      // which makes it impossible to test it with BigTest/mirage...
      it.skip('should have focus on input', () => TextInput({ id: 'input-tag-input' }).is({ focused: true }));

      describe('includes it in the list', () => {
        beforeEach(async () => {
          await MultiSelect().filter('tag-test');
        });

        it('includes "tag-test" in the options list', () => MultiSelectOption('tag-test').exists());
      });
    });
  });

  describe('Tags with Optimistic Locking', () => {
    setupApplication({
      component: (
        <ConnectedTags
          link="dummy/entity"
          hasOptimisticLocking
        />
      ),
    });

    beforeEach(async function () {
      await this.server.createList('tag', 10);
    });

    describe('when editing tags and update is loading', () => {
      beforeEach(async function () {
        await MultiSelect().filter('tag-test');
        this.server.timing = 5000;
        await MultiSelectOption(including('Add tag for')).click();
      });

      afterEach(function () {
        this.server.timing = 0;
      });

      it('should disable the input', () => TextInput({ id: 'input-tag-input' }).is({ disabled: true }));
    });
  });

  describe('Tags Accordion', () => {
    setupApplication({
      component: (<ConnectedTagsAccordion
        link="dummy/entity"
      />),
    });

    beforeEach(async function () {
      await this.server.createList('tag', 10);
      await Accordion().clickHeader();
      await MultiSelect().toggle();
    });

    it('renders', () => Accordion().exists());
    it('has no accessibility errors', async () => runAxeTest);
    it('contains rendered label for the MultiSelect', () => AriaLabelledMultiSelect({ ariaLabel: 'Tag text area' }).exists());
    it('renders tags as options', () => MultiSelectMenu().has({ optionCount: 10 }));
  });

  describe('Tags HOC', () => {
    setupApplication({
      component: (<ConnectedWithTags
        link="dummy/entity"
      />),
    });

    beforeEach(async function () {
      await this.server.createList('tag', 10);
    });

    it('renders', () => HTML({ id: 'taglist' }).exists());

    it('renders tags as listItems', () => List().has({ count: 10 }));
  });
});
