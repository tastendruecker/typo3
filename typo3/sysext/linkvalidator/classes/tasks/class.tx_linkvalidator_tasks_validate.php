<?php
/***************************************************************
 *  Copyright notice
 *
 *  (c) 2005 - 2010 Michael Miousse (michael.miousse@infoglobe.ca)
 *  All rights reserved
 *
 *  This script is part of the TYPO3 project. The TYPO3 project is
 *  free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  The GNU General Public License can be found at
 *  http://www.gnu.org/copyleft/gpl.html.
 *
 *  This script is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  This copyright notice MUST APPEAR in all copies of the script!
 ***************************************************************/

/**
 * This class provides Scheduler plugin implementation.
 *
 * @author Michael Miousse <michael.miousse@infoglobe.ca>
 * @package TYPO3
 * @subpackage linkvalidator
 */
class tx_linkvalidator_tasks_Validate extends tx_scheduler_Task {

	/**
	 * @var integer
	 */
	public $sleepTime;

	/**
	 * @var integer
	 */
	public $sleepAfterFinish;

	/**
	 * @var integer
	 */
	public $countInARun;

	/**
	 * Total number of broken links.
	 *
	 * @var integer
	 */
	public $totalBrokenLink = 0;

	/**
	 * Total number of broken links from the last run.
	 *
	 * @var integer
	 */
	public $oldTotalBrokenLink = 0;

	/**
	 * Mail template fetched from the given template file.
	 *
	 * @var string
	 */
	public $templateMail;
	
	/**
	 * specific TSconfig for this task.
	 *
	 * @var array
	 */
	public $configuration = array();

	/**
	 * Shows if number of result was diferent from the result of the last check or not.
	 *
	 * @var boolean
	 */
	public $dif;

	/**
	 * Template to be used for the email.
	 *
	 * @var string
	 */
	public $emailTemplateFile;

	/**
	 * Level of pages the task should check.
	 *
	 * @var integer
	 */
	public $depth;

	/**
	 * UID of the start page for this task.
	 *
	 * @var integer
	 */
	public $page;

	/**
	 * Email address to which an email report is sent.
	 *
	 * @var string
	 */
	public $email;

	/**
	 * Only send an email, if new broken links were found.
	 *
	 * @var boolean
	 */
	public $emailOnBrokenLinkOnly;

	/**
	 * Function executed from the Scheduler.
	 *
	 * @return	void
	 */
	public function execute() {
		$this->setCliArguments();
		$successfullyExecuted = TRUE;
		if (!file_exists($file = t3lib_div::getFileAbsFileName($this->emailTemplateFile)) && !empty($this->email)) {
			throw new Exception(
				$GLOBALS['LANG']->sL('LLL:EXT:linkvalidator/locallang.xml:tasks.error.invalidEmailTemplateFile'),
				'1295476972'
			);
		}
		$htmlFile = t3lib_div::getURL($file);
		$this->templateMail = t3lib_parsehtml::getSubpart($htmlFile, '###REPORT_TEMPLATE###');

			// The array to put the content into
		$html = array();
		$pageSections = '';
		$this->dif = FALSE;
		$pageList = t3lib_div::trimExplode(',', $this->page, 1);
		if (is_array($pageList)) {
			foreach ($pageList as $page) {
				$modTS = t3lib_BEfunc::getModTSconfig($page, 'mod.linkvalidator');
				$parseObj = t3lib_div::makeInstance('t3lib_TSparser');
				$parseObj->parse($this->configuration);
				if(count($parseObj->errors) > 0){
					$parseErrorMessage = $GLOBALS['LANG']->sL('LLL:EXT:linkvalidator/locallang.xml:tasks.error.invalidTSconfig') . '<br />';
					foreach($parseObj->errors as $errorInfo){
						$parseErrorMessage .= $errorInfo[0] . '<br />';
					}
					throw new Exception(
						$parseErrorMessage,
						'1295476989'
					);
				}
				$TSconfig = $parseObj->setup;
				$modTS = $modTS['properties'];
				$overrideTs = $TSconfig['mod.']['tx_linkvalidator.'];
				if (is_array($overrideTs)) {
					$modTS = t3lib_div::array_merge_recursive_overrule($modTS, $overrideTs);
				}

					// get the searchFields from TCA
				foreach ($GLOBALS['TCA'] as $tablename => $table) {
					if (!empty($table['columns'])) {
						foreach ($table['columns'] as $columnname => $column) {
							if ($column['config']['type'] == 'text' || $column['config']['type'] == 'input') {
								if (!empty($column['config']['softref']) && (stripos($column['config']['softref'], "typolink")
										!== FALSE || stripos($column['config']['softref'], "url") !== FALSE)) {

									$searchFields[$tablename][] = $columnname;
								}
							}
						}
					}
				}

					// get the searchFields from TypoScript
				foreach ($modTS['searchFields.'] as $table => $fieldList) {
					$fields = t3lib_div::trimExplode(',', $fieldList);
					foreach ($fields as $field) {
						if (is_array($searchFields[$table])) {
							if (array_search($field, $searchFields[$table]) === FALSE) {
								$searchFields[$table][] = $field;
							}
						}
					}
				}
				$linktypes = t3lib_div::trimExplode(',', $modTS['linktypes'], 1);
				if (is_array($linktypes)) {
					if (!empty($GLOBALS['TYPO3_CONF_VARS']['EXTCONF']['linkvalidator']['checkLinks'])
							&& is_array($GLOBALS['TYPO3_CONF_VARS']['EXTCONF']['linkvalidator']['checkLinks'])) {
						foreach ($GLOBALS['TYPO3_CONF_VARS']['EXTCONF']['linkvalidator']['checkLinks'] as $type => $value) {
							if (in_array($type, $linktypes)) {
								$array[$type] = 1;
							}
						}
					}
				}
				$processing = t3lib_div::makeInstance('tx_linkvalidator_processing');
				$pageIds = $processing->extGetTreeList($page, $this->depth, 0, '1=1');
				$pageIds .= $page;
				$processing->init($searchFields, $pageIds);
				if (!empty($this->email)) {
					$oldLinkCounts = $processing->getLinkCounts($page);
					$this->oldTotalBrokenLink += $oldLinkCounts['brokenlinkCount'];
				}

				$processing->getLinkStatistics($array, $modTS['checkhidden']);

				if (!empty($this->email)) {
					$linkCounts = $processing->getLinkCounts($page);
					$this->totalBrokenLink += $linkCounts['brokenlinkCount'];
					$pageSections .= $this->buildMail($page, $pageIds, $linkCounts, $oldLinkCounts);
				}

			}
		}
		if ($this->totalBrokenLink != $this->oldTotalBrokenLink) {
			$this->dif = TRUE;
		}
		if ($this->totalBrokenLink > 0
			&& (!$this->emailOnBrokenLinkOnly || $this->dif)
			&& !empty($this->email)
		) {
			$successfullyExecuted = $this->reportEmail($pageSections, $modTS);
		}
		return $successfullyExecuted;
	}


	/**
	 * Build and send warning email when new broken links were found.
	 *
	 * @param	string		$pageSections: Content of page section
	 * @param	string		$modTS: TSconfig array
	 * @return	bool		TRUE if mail was sent, FALSE if or not
	 */
	function reportEmail($pageSections, $modTS) {
		$content = t3lib_parsehtml::substituteSubpart($this->templateMail, '###PAGE_SECTION###', $pageSections);
		/** @var array $markerArray */
		$markerArray = array();
		/** @var array $validEmailList */
		$validEmailList = array();
		/** @var boolean $sendEmail */
		$sendEmail = TRUE;

		$markerArray['totalBrokenLink'] = $this->totalBrokenLink;
		$markerArray['totalBrokenLink_old'] = $this->oldTotalBrokenLink;
		$content = t3lib_parsehtml::substituteMarkerArray($content, $markerArray, '###|###', TRUE, TRUE);

		/** @var t3lib_mail_Message $mail */
		$mail = t3lib_div::makeInstance('t3lib_mail_Message');
		if (t3lib_div::validEmail($modTS['mail.']['fromemail'])) {
			$mail->setFrom(array($modTS['mail.']['fromemail'] => $modTS['mail.']['fromname']));
		} else {
			throw new Exception(
				$GLOBALS['LANG']->sL('LLL:EXT:linkvalidator/locallang.xml:tasks.error.invalidFromEmail'),
				'1295476760'
			);
		}
		if(t3lib_div::validEmail($modTS['mail.']['replytoemail'])) {
			$mail->setReplyTo(array($modTS['mail.']['replytoemail'] => $modTS['mail.']['replytoname']));
		}

		if(!empty($modTS['mail.']['subject'])) {
			$mail->setSubject($modTS['mail.']['subject']);
		} else {
			throw new Exception(
				$GLOBALS['LANG']->sL('LLL:EXT:linkvalidator/locallang.xml:tasks.error.noSubject'),
				'1295476808'
			);
		}
		if (!empty($this->email)) {
			$emailList = t3lib_div::trimExplode(',', $this->email);
			foreach ($emailList as $emailAdd) {
				if (!t3lib_div::validEmail($emailAdd)) {
					throw new Exception(
						$GLOBALS['LANG']->sL('LLL:EXT:linkvalidator/locallang.xml:tasks.error.invalidToEmail'),
						'1295476821'
					);
				} else {
					$validEmailList[] = $emailAdd;
				}
			}
		}
		if (is_array($validEmailList) && !empty($validEmailList)) {
			$mail->setTo($this->email);
		} else {
			$sendEmail = FALSE;
		}

		if($sendEmail) {
			$mail->setBody($content,'text/html');
			$mail->send();
		}

		return $sendEmail;
	}


	/**
	 * Build the mail content.
	 *
	 * @param	int			$curPage: id of the current page
	 * @param	string		$pageList: list of pages id
	 * @param	array		$markerArray: array of markers
	 * @param	array		$oldBrokenLink: markerarray with the number of link found
	 * @return	string		Content of the mail
	 */
	function buildMail($curPage, $pageList, $markerArray, $oldBrokenLink) {
		$pageSectionHTML = t3lib_parsehtml::getSubpart($this->templateMail, '###PAGE_SECTION###');

		if (is_array($markerArray)) {
			foreach ($markerArray as $markerKey => $markerValue) {
				if (empty($oldBrokenLink[$markerKey])) {
					$oldBrokenLink[$markerKey] = 0;
				}
				if ($markerValue != $oldBrokenLink[$markerKey]) {
					$this->dif = TRUE;
				}
				$markerArray[$markerKey . '_old'] = $oldBrokenLink[$markerKey];
			}
		}
		$markerArray['title'] = t3lib_BEfunc::getRecordTitle('pages', t3lib_BEfunc::getRecord('pages', $curPage));

		$content = '';
		if ($markerArray['brokenlinkCount'] > 0) {
			$content = t3lib_parsehtml::substituteMarkerArray($pageSectionHTML, $markerArray, '###|###', TRUE, TRUE);
		}
		return $content;
	}


	/**
	 * Simulate cli call with setting the required options to the $_SERVER['argv']
	 *
	 * @return	void
	 * @access protected
	 */
	protected function setCliArguments() {
		$_SERVER['argv'] = array(
			$_SERVER['argv'][0],
			'tx_link_scheduler_link',
			'0',
			'-ss',
			'--sleepTime',
			$this->sleepTime,
			'--sleepAfterFinish',
			$this->sleepAfterFinish,
			'--countInARun',
			$this->countInARun
		);
	}
}

if (defined('TYPO3_MODE') && isset($GLOBALS['TYPO3_CONF_VARS'][TYPO3_MODE]['XCLASS']['ext/linkvalidator/classes/tasks/class.tx_linkvalidator_tasks_validate.php'])) {
	include_once($GLOBALS['TYPO3_CONF_VARS'][TYPO3_MODE]['XCLASS']['ext/linkvalidator/classes/tasks/class.tx_linkvalidator_tasks_validate.php']);
}
?>